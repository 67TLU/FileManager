import type { Response, NextFunction } from 'express';
import { db } from '../../config/database.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { requireFunctionalPermission } from '../../shared/utils/permission.js';

export class RolesController {
  /**
   * GET /api/v1/roles
   * Lấy danh sách roles (cho admin)
   */
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await requireFunctionalPermission(req.user!.id, 'role.view');

      const roles = await db.selectFrom('roles')
        .select([
          'roles.id',
          'roles.key',
          'roles.name',
          'roles.is_system',
        ])
        .orderBy('roles.name')
        .execute();

      // Đếm số user có mỗi role
      const userCounts = await db.selectFrom('user_roles')
        .select([
          'role_id',
          db.fn.count<number>('user_id').as('user_count'),
        ])
        .groupBy('role_id')
        .execute();

      const countMap = new Map(userCounts.map(c => [c.role_id, Number(c.user_count)]));

      res.json({
        success: true,
        data: roles.map(r => ({
          ...r,
          user_count: countMap.get(r.id) || 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
}