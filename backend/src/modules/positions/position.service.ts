// src/modules/positions/position.service.ts
import crypto from 'crypto';
import { db } from '../../config/database.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';

export class PositionService {
  async listPositions() {
    return await db.selectFrom('positions' as any)
      .select(['id', 'code', 'name', 'level', 'description', 'is_system'] as any)
      .where('deleted_at', 'is', null)
      .orderBy('level')
      .execute();
  }

  async getPositionById(positionId: string) {
    const position = await db.selectFrom('positions' as any)
      .select(['id', 'code', 'name', 'level', 'description', 'is_system', 'created_at'] as any)
      .where('id', '=', positionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!position) throw new AppError(404, 'Chức vụ không tồn tại');

    // Đếm số user đang giữ chức vụ này
    const countResult = await db.selectFrom('users')
      .select(db.fn.count<number>('id').as('user_count'))
      .where('position_id' as any, '=', positionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirstOrThrow();

    return { ...position, user_count: Number(countResult.user_count) };
  }

  async createPosition(data: { code: string; name: string; level: string; description?: string }) {
    const existing = await db.selectFrom('positions' as any)
      .select('id' as any)
      .where('code', '=', data.code)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (existing) throw new AppError(409, 'Mã chức vụ đã tồn tại');

    const positionId = crypto.randomUUID();
    await db.insertInto('positions' as any)
      .values({
        id: positionId,
        code: data.code,
        name: data.name,
        level: data.level,
        description: data.description,
      } as any)
      .execute();

    return this.getPositionById(positionId);
  }

  async updatePosition(positionId: string, data: { name?: string; level?: string; description?: string }) {
    const position = await db.selectFrom('positions' as any)
      .select(['id', 'is_system'] as any)
      .where('id', '=', positionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!position) throw new AppError(404, 'Chức vụ không tồn tại');
    if ((position as any).is_system) throw new AppError(400, 'Không thể sửa chức vụ hệ thống');

    await db.updateTable('positions' as any)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.description !== undefined && { description: data.description }),
      } as any)
      .where('id', '=', positionId)
      .execute();

    return this.getPositionById(positionId);
  }

  async deletePosition(positionId: string) {
    const position = await db.selectFrom('positions' as any)
      .select(['id', 'is_system'] as any)
      .where('id', '=', positionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!position) throw new AppError(404, 'Chức vụ không tồn tại');
    if ((position as any).is_system) throw new AppError(400, 'Không thể xóa chức vụ hệ thống');

    // Kiểm tra có user nào đang dùng không
    const hasUsers = await db.selectFrom('users')
      .select('id')
      .where('position_id' as any, '=', positionId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (hasUsers) {
      throw new AppError(400, 'Không thể xóa chức vụ đang có nhân viên sử dụng');
    }

    await db.updateTable('positions' as any)
      .set({ deleted_at: new Date() } as any)
      .where('id', '=', positionId)
      .execute();
  }
}