import { db } from '../../config/database.js';
import { sql } from 'kysely';

export class DashboardService {
  /**
   * Lấy thống kê tổng quan cho user
   */
  async getStats(userId: string) {
    // 1. Tổng số resources của user (created_by)
    const totalFilesResult = await db.selectFrom('resources')
      .select(db.fn.count<number>('id').as('count'))
      .where('created_by', '=', userId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .executeTakeFirstOrThrow();

    // 2. Tổng dung lượng user đã upload
    const totalSizeResult = await db.selectFrom('resources')
      .select(db.fn.sum<number>('size_bytes').as('total'))
      .where('created_by', '=', userId)
      .where('deleted_at', 'is', null)
      .where('status', '=', 'active')
      .executeTakeFirstOrThrow();

    // 3. Số resources trong thùng rác
    const trashCountResult = await db.selectFrom('resources')
      .select(db.fn.count<number>('id').as('count'))
      .where('created_by', '=', userId)
      .where('status', '=', 'trashed')
      .where('deleted_at', 'is', null)
      .executeTakeFirstOrThrow();

    // 4. Số lần download của user (từ audit_logs)
    const downloadCountResult = await db.selectFrom('audit_logs')
      .select(db.fn.count<number>('id').as('count'))
      .where('actor_id', '=', userId)
      .where('action', '=', 'resource.download')
      .executeTakeFirstOrThrow();

    // 5. Số lần upload của user
    const uploadCountResult = await db.selectFrom('audit_logs')
      .select(db.fn.count<number>('id').as('count'))
      .where('actor_id', '=', userId)
      .where('action', '=', 'resource.upload')
      .executeTakeFirstOrThrow();

    return {
      totalFiles: Number(totalFilesResult.count),
      totalSizeBytes: Number(totalSizeResult.total || 0),
      trashCount: Number(trashCountResult.count),
      downloadCount: Number(downloadCountResult.count),
      uploadCount: Number(uploadCountResult.count),
    };
  }

  /**
   * Lấy hoạt động gần đây của user
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    const activities = await db.selectFrom('audit_logs')
      .leftJoin('resources', 'resources.id', 'audit_logs.target_id')
      .leftJoin('folders', 'folders.id', 'resources.folder_id')
      .select([
        'audit_logs.id',
        'audit_logs.action',
        'audit_logs.occurred_at',
        'audit_logs.target_type',
        'audit_logs.target_id',
        'audit_logs.metadata',
        'resources.name as resource_name',
        'resources.mime_type',
        'folders.name as folder_name',
      ])
      .where('audit_logs.actor_id', '=', userId)
      .where('audit_logs.target_type', '=', 'resource')
      .orderBy('audit_logs.occurred_at', 'desc')
      .limit(limit)
      .execute();

    return activities.map(a => ({
      id: a.id,
      action: a.action,
      occurredAt: a.occurred_at,
      resource: a.resource_name ? {
        id: a.target_id,
        name: a.resource_name,
        mimeType: a.mime_type,
        folderName: a.folder_name,
      } : null,
      metadata: a.metadata,
    }));
  }

  /**
   * Lấy thống kê storage theo tháng (cho chart)
   */
  async getStorageTrend(userId: string, months: number = 6) {
    const trend = await db
      .selectFrom('audit_logs')
      .leftJoin('resources', 'resources.id', 'audit_logs.target_id')
      .select([
        sql<Date>`DATE_TRUNC('month', audit_logs.occurred_at)`.as('month'),
        db.fn.sum<number>('resources.size_bytes').as('total_bytes'),
        db.fn.count<number>('audit_logs.id').as('upload_count'),
      ])
      .where('audit_logs.actor_id', '=', userId)
      .where('audit_logs.action', '=', 'resource.upload')
      .where(
        'audit_logs.occurred_at',
        '>=',
        sql<Date>`NOW() - (INTERVAL '1 month' * ${months})`
      )
      .groupBy(sql`DATE_TRUNC('month', audit_logs.occurred_at)`)
      .orderBy('month', 'asc')
      .execute();

    return trend.map((t) => ({
      month: t.month,
      totalBytes: Number(t.total_bytes || 0),
      uploadCount: Number(t.upload_count),
    }));
  }

}