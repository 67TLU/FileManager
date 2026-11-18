import type { Response, NextFunction } from 'express';
import { db } from '../../config/database.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';

export class MeController {
  /**
   * GET /api/v1/me
   * Lấy thông tin profile của user hiện tại
   */
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

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
        ])
        .where('user_roles.user_id', '=', userId)
        .execute();

      // Lấy danh sách thiết bị đang đăng nhập (active refresh tokens)
      const activeSessions = await db.selectFrom('refresh_tokens')
        .select([
          'refresh_tokens.id',
          'refresh_tokens.ip',
          'refresh_tokens.user_agent',
          'refresh_tokens.created_at',
          'refresh_tokens.expires_at',
        ])
        .where('refresh_tokens.user_id', '=', userId)
        .where('refresh_tokens.revoked_at', 'is', null)
        .where('refresh_tokens.expires_at', '>', new Date())
        .orderBy('refresh_tokens.created_at', 'desc')
        .execute();

      res.json({
        success: true,
        data: {
          ...user,
          departments,
          roles,
          activeSessions: activeSessions.map(s => ({
            id: s.id,
            ip: s.ip,
            userAgent: s.user_agent,
            createdAt: s.created_at,
            expiresAt: s.expires_at,
            isCurrent: false, // Sẽ đánh dấu ở frontend
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/me/sessions/:sessionId
   * Revoke 1 session cụ thể
   */
  revokeSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId as string;

      const result = await db.updateTable('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('id', '=', sessionId)
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .executeTakeFirst();

      if (result.numUpdatedRows.toString() === '0') {
        throw new AppError(404, 'Session không tồn tại');
      }

      // Audit log
      await db.insertInto('audit_logs').values({
        actor_id: userId,
        action: 'auth.revoke_session',
        target_type: 'refresh_token',
        target_id: sessionId,
      }).execute();

      res.json({ success: true, message: 'Đã đăng xuất thiết bị' });
    } catch (error) {
      next(error);
    }
  };
}