import crypto from 'crypto';
import bcrypt from 'bcrypt';
import {db} from '../../config/database.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';

import {EmailService} from '../../shared/services/email.service.js';

import {requireFunctionalPermission} from '../../shared/utils/permission.js';


export class InvitationService {
  private emailService = new EmailService();

  async createInvitation(
    inviterId: string,
    data: {
      email: string;
      departmentId?: string;
      positionId?: string;
      roleIds: string[];
    }
  ) {
    // 1. Check permission
    await requireFunctionalPermission(inviterId, 'user.invite');

    // 2. Check email đã tồn tại chưa
    const existingUser = await db.selectFrom('users')
      .select('id')
      .where('email', '=', data.email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (existingUser) {
      throw new AppError(409, 'Email đã được sử dụng');
    }

    // 3. Check đã có invitation pending chưa
    const existingInvitation = await db.selectFrom('invitations')
      .select('id')
      .where('email', '=', data.email)
      .where('status', '=', 'pending')
      .where('expires_at', '>', new Date())
      .executeTakeFirst();

    if (existingInvitation) {
      throw new AppError(409, 'Đã có lời mời đang chờ cho email này');
    }

    // 4. Tạo token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    // 5. Lưu invitation
    const invitationId = crypto.randomUUID();
    await db.insertInto('invitations')
      .values({
        id: invitationId,
        email: data.email,
        token_hash: tokenHash,
        invited_by: inviterId,
        department_id: data.departmentId,
        position_id: data.positionId,
        role_ids: data.roleIds,
        status: 'pending',
        expires_at: expiresAt,
      })
      .execute();

    // 6. Gửi email
    const inviter = await db.selectFrom('users')
      .select('full_name')
      .where('id', '=', inviterId)
      .executeTakeFirstOrThrow();

    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
    await this.emailService.sendInvitationEmail(data.email, invitationLink, inviter.full_name);

    // 7. Audit log
    await db.insertInto('audit_logs')
      .values({
        actor_id: inviterId,
        action: 'invitation.create',
        target_type: 'invitation',
        target_id: invitationId,
        metadata: JSON.stringify({ email: data.email, departmentId: data.departmentId }) as any,
      })
      .execute();

    return { id: invitationId, email: data.email, expiresAt };
  }

  async acceptInvitation(token: string, password: string, fullName: string) {
    // 1. Verify token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const invitation = await db.selectFrom('invitations')
      .select(['id', 'email', 'invited_by', 'department_id', 'position_id', 'role_ids', 'status', 'expires_at'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    if (!invitation) {
      throw new AppError(400, 'Token không hợp lệ');
    }

    if (invitation.status !== 'pending') {
      throw new AppError(400, 'Lời mời không còn hiệu lực');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      // Đánh dấu hết hạn
      await db.updateTable('invitations')
        .set({ status: 'expired' })
        .where('id', '=', invitation.id)
        .execute();
      throw new AppError(400, 'Lời mời đã hết hạn');
    }

    // 2. Tạo user
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.transaction().execute(async (trx) => {
      // Tạo user
      await trx.insertInto('users' as any)
        .values({
          id: userId,
          email: invitation.email,
          password_hash: passwordHash,
          full_name: fullName,
          position_id: invitation.position_id,
          status: 'active',
          email_verified_at: new Date(),
        } as any)
        .execute();

      // Gán vào department
      if (invitation.department_id) {
        await trx.insertInto('department_members')
          .values({
            department_id: invitation.department_id,
            user_id: userId,
            is_manager: false,
          })
          .execute();
      }

      // Gán roles
      if (invitation.role_ids.length > 0) {
        await trx.insertInto('user_roles')
          .values(invitation.role_ids.map(roleId => ({
            id: crypto.randomUUID(),
            user_id: userId,
            role_id: roleId,
            scope_type: 'global' as const,
          })))
          .execute();
      }

      // Tạo personal workspace
      await trx.insertInto('workspaces')
        .values({
          id: crypto.randomUUID(),
          type: 'personal',
          name: `Của ${fullName}`,
          owner_user_id: userId,
          created_by: userId,
        })
        .execute();

      // Đánh dấu invitation đã chấp nhận
      await trx.updateTable('invitations')
        .set({
          status: 'accepted',
          accepted_at: new Date(),
          accepted_by: userId,
        })
        .where('id', '=', invitation.id)
        .execute();

      // Audit log
      await trx.insertInto('audit_logs')
        .values({
          actor_id: userId,
          action: 'invitation.accept',
          target_type: 'invitation',
          target_id: invitation.id,
          metadata: JSON.stringify({ email: invitation.email }) as any,
        })
        .execute();
    });

    return { userId, email: invitation.email };
  }

  async listInvitations(options: { status?: string; page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = db.selectFrom('invitations')
      .leftJoin('users as inviter', 'inviter.id', 'invitations.invited_by')
      .leftJoin('users as accepted', 'accepted.id', 'invitations.accepted_by')
      .leftJoin('departments', 'departments.id', 'invitations.department_id')
      .select([
        'invitations.id',
        'invitations.email',
        'invitations.status',
        'invitations.expires_at',
        'invitations.created_at',
        'invitations.accepted_at',
        'inviter.full_name as inviter_name',
        'accepted.full_name as accepted_by_name',
        'departments.name as department_name',
      ])
      .orderBy('invitations.created_at', 'desc');

    if (options.status) {
      query = query.where('invitations.status', '=', options.status);
    }

    const invitations = await query.limit(limit).offset(offset).execute();

    const countResult = await db.selectFrom('invitations')
      .select(db.fn.count<number>('id').as('total'))
      .executeTakeFirstOrThrow();

    return {
      data: invitations,
      pagination: {
        page,
        limit,
        total: Number(countResult.total),
        totalPages: Math.ceil(Number(countResult.total) / limit),
      },
    };
  }

  async revokeInvitation(invitationId: string, userId: string) {
    const invitation = await db.selectFrom('invitations')
      .select(['id', 'status'])
      .where('id', '=', invitationId)
      .executeTakeFirst();

    if (!invitation) throw new AppError(404, 'Lời mời không tồn tại');

    if (invitation.status !== 'pending') {
      throw new AppError(400, 'Chỉ có thể thu hồi lời mời đang chờ');
    }

    await db.updateTable('invitations')
      .set({
        status: 'revoked',
        revoked_at: new Date(),
      })
      .where('id', '=', invitationId)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        actor_id: userId,
        action: 'invitation.revoke',
        target_type: 'invitation',
        target_id: invitationId,
      })
      .execute();

    return { message: 'Lời mời đã được thu hồi' };
  }
}