import { sql } from 'kysely';
import { db } from '../../config/database.js';
import { accessibleResourceSql } from '../../shared/utils/permission.js';

export class SearchService {
  private base(userId: string) {
    return db.selectFrom('resources')
      .innerJoin('folders', 'folders.id', 'resources.folder_id')
      .leftJoin('users', 'users.id', 'resources.created_by')
      .select([
        'resources.id', 'resources.name', 'resources.type', 'resources.mime_type',
        'resources.size_bytes', 'resources.status', 'resources.created_at',
        'resources.updated_at', 'resources.folder_id', 'resources.trashed_at',
        'folders.name as folder_name', 'users.full_name as created_by_name',
      ])
      .where('resources.deleted_at', 'is', null)
      .where('resources.status', '=', 'active')
      .where(accessibleResourceSql(userId));
  }

  async searchResources(userId: string, query: string, options: {
    page?: number; limit?: number; type?: string; folderId?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    let q = this.base(userId);

    if (query) q = q.where('resources.name', 'ilike', `%${query}%`);
    if (options.type) q = q.where('resources.type', '=', options.type);
    if (options.folderId) {
      q = q.where('folders.path', '<@',
        sql`(SELECT path FROM folders WHERE id = ${options.folderId})` as any);
    }

    const rows = await q.orderBy('resources.created_at', 'desc')
      .limit(limit).offset((page - 1) * limit).execute();
    const total = rows.length === 0 ? 0 : Number((rows[0] as any).__total ?? rows.length);

    return {
      data: rows.map((r) => ({ ...r, size_bytes: Number(r.size_bytes) })),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async advancedSearch(userId: string, payload: any) {
    const page = payload.page || 1;
    const limit = Math.min(payload.limit || 20, 100);
    const f = payload.filters ?? {};
    let q = this.base(userId);

    if (payload.query) q = q.where('resources.name', 'ilike', `%${payload.query}%`);
    if (f.types?.length) q = q.where('resources.type', 'in', f.types);
    if (f.mimeTypes?.length) q = q.where('resources.mime_type', 'in', f.mimeTypes);
    if (f.createdBy?.length) q = q.where('resources.created_by', 'in', f.createdBy);
    if (f.folderIds?.length) {
      q = q.where((eb) => eb.or(f.folderIds.map((id: string) =>
        eb('folders.path', '<@', sql`(SELECT path FROM folders WHERE id = ${id})` as any))));
    }
    if (f.dateRange?.from) q = q.where('resources.created_at', '>=', new Date(f.dateRange.from));
    if (f.dateRange?.to) q = q.where('resources.created_at', '<=', new Date(f.dateRange.to));
    if (f.sizeRange?.min !== undefined) q = q.where('resources.size_bytes', '>=', f.sizeRange.min);
    if (f.sizeRange?.max !== undefined) q = q.where('resources.size_bytes', '<=', f.sizeRange.max);

    const rows = await q.orderBy('resources.created_at', 'desc')
      .limit(limit).offset((page - 1) * limit).execute();

    return {
      data: rows.map((r) => ({ ...r, size_bytes: Number(r.size_bytes) })),
      pagination: { page, limit, total: rows.length, totalPages: 1 },
    };
  }

  async getSuggestions(userId: string, q: string) {
    if (!q || q.length < 2) return [];
    const rows = await this.base(userId)
      .clearSelect().select('resources.name')
      .where('resources.name', 'ilike', `%${q}%`)
      .distinct().limit(10).execute();
    return rows.map((r) => r.name);
  }

  /** Recent = resource chính user này đã view/download (từ audit_logs) */
  async getRecentResources(userId: string, limit = 10) {
    const rows = await db.selectFrom('audit_logs')
      .innerJoin('resources', 'resources.id', 'audit_logs.target_id')
      .innerJoin('folders', 'folders.id', 'resources.folder_id')
      .select([
        'resources.id', 'resources.name', 'resources.type', 'resources.mime_type',
        'resources.size_bytes', 'resources.status', 'resources.created_at',
        'resources.updated_at', 'resources.folder_id', 'resources.trashed_at',
        'folders.name as folder_name',
        sql<string>`MAX(audit_logs.occurred_at)`.as('last_accessed'),
      ])
      .where('audit_logs.actor_id', '=', userId)
      .where('audit_logs.action', 'in', ['resource.view', 'resource.download'])
      .where('audit_logs.target_type', '=', 'resource')
      .where('resources.deleted_at', 'is', null)
      .where('resources.status', '=', 'active')
      .where(accessibleResourceSql(userId))
      .groupBy(['resources.id', 'folders.name'])
      .orderBy('last_accessed', 'desc')
      .limit(limit).execute();

    return rows.map((r) => ({ ...r, size_bytes: Number(r.size_bytes), created_by_name: null }));
  }
}