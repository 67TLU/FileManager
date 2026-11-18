import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {db} from '../../config/database.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';

import { sql } from 'kysely';

export class UserService {
    async updateUserRoles(userId: string, roleIds: string[], actorId: string) {
    const user = await db.selectFrom('users').select('id')
      .where('id', '=', userId).where('deleted_at', 'is', null).executeTakeFirst();
    if (!user) throw new AppError(404, 'User không tồn tại');
    if (roleIds.length === 0) throw new AppError(400, 'Phải giữ ít nhất 1 vai trò');

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('user_roles')
        .where('user_id', '=', userId).where('scope_type', '=', 'global').execute();
      await trx.insertInto('user_roles').values(roleIds.map((roleId) => ({
        id: crypto.randomUUID(), user_id: userId, role_id: roleId,
        scope_type: 'global', granted_by: actorId,
      }))).execute();
      // Thu hồi session để quyền mới có hiệu lực ngay
      await trx.updateTable('refresh_tokens').set({ revoked_at: new Date() })
        .where('user_id', '=', userId).where('revoked_at', 'is', null).execute();
      await trx.insertInto('audit_logs').values({
        actor_id: actorId, action: 'user.assign_role', target_type: 'user',
        target_id: userId, metadata: JSON.stringify({ roleIds }),
      }).execute();
    });
    return this.getUserById(userId);
  }
  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    departmentId?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Hàm tạo điều kiện tìm kiếm
    const buildSearchConditions = (eb: import('kysely').ExpressionBuilder<any, any>) =>
      eb.or([
        eb('users.email', 'ilike', `%${options.search}%`),
        eb('users.full_name', 'ilike', `%${options.search}%`),
      ]);

    // Khởi tạo query gốc
    const query = db.selectFrom('users')
      .leftJoin('positions' as any, 'positions.id', 'users.position_id')
      .leftJoin('department_members', 'department_members.user_id', 'users.id')
      .leftJoin('departments', 'departments.id', 'department_members.department_id')
      .select([
        'users.id',
        'users.email',
        'users.full_name',
        'users.status',
        'users.email_verified_at',
        'users.last_login_at',
        'users.created_at',
        'users.position_id',
        'positions.name as position_name',
        'positions.level as position_level',
        'departments.name as department_name',
      ])
      .where('users.deleted_at', 'is', null);

    // Build conditions
    const conditions: any[] = [];
    if (options.search) {
      conditions.push(buildSearchConditions);
    }

    // Apply all conditions
    let finalQuery = query;
    for (const cond of conditions) {
      finalQuery = finalQuery.where(cond);
    }

    // Apply additional filters
    if (options.status) {
      finalQuery = finalQuery.where('users.status', '=', options.status);
    }

    if (options.departmentId) {
      finalQuery = finalQuery.where('department_members.department_id', '=', options.departmentId);
    }

    const users = await finalQuery
      .orderBy('users.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    // Count total
    const countResult = await db.selectFrom('users')
      .select(db.fn.count<number>('id').as('total'))
      .where('deleted_at', 'is', null)
      .executeTakeFirstOrThrow();

    return {
      data: users,
      pagination: {
        page,
        limit,
        total: Number(countResult.total),
        totalPages: Math.ceil(Number(countResult.total) / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await db.selectFrom('users')
      .leftJoin('positions' as any, 'positions.id', 'users.position_id')
      .select([
        'users.id',
        'users.email',
        'users.full_name',
        'users.status',
        'users.email_verified_at',
        'users.last_login_at',
        'users.created_at',
        'users.position_id',
        'positions.name as position_name',
        'positions.level as position_level',
      ])
      .where('users.id', '=', userId)
      .where('users.deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) throw new AppError(404, 'User không tồn tại');

    // Lấy departments
    const departments = await db.selectFrom('department_members')
      .innerJoin('departments', 'departments.id', 'department_members.department_id')
      .select([
        'departments.id',
        'departments.name',
        'departments.code',
        'department_members.is_manager',
      ])
      .where('department_members.user_id', '=', userId)
      .execute();

    // Lấy roles
    const roles = await db.selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select([
        'roles.id',
        'roles.key',
        'roles.name',
        'user_roles.scope_type',
        'user_roles.scope_id',
      ])
      .where('user_roles.user_id', '=', userId)
      .execute();

    return { ...user, departments, roles };
  }

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    positionId?: string;
    departmentIds?: string[];
    roleIds?: string[];
  }) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await db.selectFrom('users')
      .select('id')
      .where('email', '=', data.email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (existing) throw new AppError(409, 'Email đã được sử dụng');

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);

    await db.transaction().execute(async (trx) => {
      // Tạo user
      await trx.insertInto('users' as any)
        .values({
          id: userId,
          email: data.email,
          password_hash: passwordHash,
          full_name: data.fullName,
          position_id: data.positionId,
          status: 'active',
          email_verified_at: new Date(),
        } as any)
        .execute();

      // Gán departments
      if (data.departmentIds?.length) {
        await trx.insertInto('department_members')
          .values(data.departmentIds.map(deptId => ({
            department_id: deptId,
            user_id: userId,
            is_manager: false,
          })))
          .execute();
      }

      // Gán roles
      if (data.roleIds?.length) {
        await trx.insertInto('user_roles')
          .values(data.roleIds.map(roleId => ({
            id: crypto.randomUUID(),
            user_id: userId,
            role_id: roleId,
            scope_type: 'global',
          })))
          .execute();
      }

      // Audit log
      await trx.insertInto('audit_logs')
        .values({
          action: 'user.create',
          target_type: 'user',
          target_id: userId,
          metadata: JSON.stringify({ email: data.email, fullName: data.fullName }),
        })
        .execute();
    });

    return this.getUserById(userId);
  }

  async updateUser(userId: string, data: {
    fullName?: string;
    positionId?: string;
    status?: string;
  }) {
    const user = await db.selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) throw new AppError(404, 'User không tồn tại');

    await db.updateTable('users')
      .set({
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.positionId !== undefined && { position_id: data.positionId }),
        ...(data.status && { status: data.status }),
      })
      .where('id', '=', userId)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'user.update',
        target_type: 'user',
        target_id: userId,
        metadata: JSON.stringify(data),
      })
      .execute();

    return this.getUserById(userId);
  }

  async deleteUser(userId: string) {
    const user = await db.selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) throw new AppError(404, 'User không tồn tại');

    // Soft delete
    await db.updateTable('users')
      .set({ deleted_at: new Date() })
      .where('id', '=', userId)
      .execute();

    // Revoke all refresh tokens
    await db.updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'user.delete',
        target_type: 'user',
        target_id: userId,
      })
      .execute();
  }
}