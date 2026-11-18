import crypto from 'crypto';
import {db} from '../../config/database.js';
import { requireFolderAccess, accessibleResourceSql } from '../../shared/utils/permission.js';

import {getStorageDriver} from '../../shared/storage/storage.factory.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';
import { sql } from 'kysely';

export class ResourceService {
  private storage = getStorageDriver();

  async uploadFile(userId: string, folderId: string, file: Express.Multer.File) {
    // 1. Kiểm tra folder tồn tại
    const folder = await db.selectFrom('folders')
      .select(['id', 'workspace_id'])
      .where('id', '=', folderId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!folder) throw new AppError(404, 'Folder không tồn tại hoặc đã bị xóa');

    // 2. Kiểm tra Quota (Đơn giản hóa: kiểm tra quota của workspace)
    const quota = await db.selectFrom('storage_quotas')
      .select(['limit_bytes', 'used_bytes'])
      .where('scope_type', '=', 'workspace')
      .where('scope_id', '=', folder.workspace_id)
      .executeTakeFirst();

    if (quota && Number(quota.used_bytes) + file.size > Number(quota.limit_bytes)) {
      throw new AppError(413, 'Dung lượng lưu trữ của không gian này đã đầy');
    }

    // 3. Tạo key duy nhất và upload lên Storage Driver
    const datePath = (new Date().toISOString() as string).split('T')[0]!.replace(/-/g, '/');
    const uniqueId = crypto.randomUUID();
    const objectKey = `resources/${datePath}/${uniqueId}-${file.originalname}`;
    
    // Tính checksum SHA-256 của file
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const storageFile = await this.storage.upload(objectKey, file.buffer, {
      metadata: { mimeType: file.mimetype, uploadedBy: userId },
    });

    // 4. DATABASE TRANSACTION (All or Nothing)
    const resourceId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const storageObjectId = crypto.randomUUID();

    try {
      await db.transaction().execute(async (trx) => {
        // 4.1. Lưu thông tin Object vật lý vào storage_objects
        await trx.insertInto('storage_objects')
          .values({
            id: storageObjectId,
            provider: 'local', // Hoặc lấy từ env
            object_key: objectKey,
            size_bytes: BigInt(file.size),
            checksum_sha256: checksum,
            mime_type: file.mimetype,
            status: 'active',
            created_by: userId,
          })
          .execute();

        // 4.2. Lưu phiên bản file (resource_versions)
        await trx.insertInto('resource_versions')
          .values({
            id: versionId,
            resource_id: resourceId,
            version_number: 1,
            storage_object_id: storageObjectId,
            original_name: file.originalname,
            size_bytes: BigInt(file.size),
            mime_type: file.mimetype,
            checksum_sha256: checksum,
            created_by: userId,
          })
          .execute();

        // 4.3. Lưu metadata tài nguyên (resources)
        await trx.insertInto('resources')
          .values({
            id: resourceId,
            folder_id: folderId,
            name: file.originalname,
            type: 'file',
            current_version_id: versionId,
            mime_type: file.mimetype,
            size_bytes: BigInt(file.size),
            status: 'active',
            created_by: userId,
          })
          .execute();

        // 4.4. Cập nhật dung lượng đã sử dụng (Storage Quota)
        if (quota) {
          await trx.updateTable('storage_quotas')
            .set({
              used_bytes: sql`used_bytes + ${BigInt(file.size)}`,
            })
            .where('scope_type', '=', 'workspace')
            .where('scope_id', '=', folder.workspace_id)
            .execute();
        }

        // 4.5. Ghi Audit Log
        await trx.insertInto('audit_logs')
          .values({
            actor_id: userId,
            action: 'resource.upload',
            target_type: 'resource',
            target_id: resourceId,
            metadata: sql`'{"fileName": "${file.originalname}", "size": ${file.size}}'::jsonb`,
          })
          .execute();
      });
    } catch (error) {
      // Log chi tiết để debug
      console.error('Upload transaction failed:', error);
      // Nếu DB lỗi, rollback tự động.
      throw new AppError(500, 'Lỗi khi lưu thông tin file vào hệ thống');
    }

    return { resourceId, name: file.originalname, size: file.size };
  }

  async downloadFile(resourceId: string, userId: string) {
    // 1. Lấy thông tin file và version hiện tại
    const resource = await db.selectFrom('resources')
      .innerJoin('resource_versions', 'resource_versions.resource_id', 'resources.id')
      .innerJoin('storage_objects', 'storage_objects.id', 'resource_versions.storage_object_id')
      .select([
        'storage_objects.object_key',
        'storage_objects.provider',
        'resources.name',
        'resources.mime_type',
        'resources.folder_id'
      ])
      .where('resources.id', '=', resourceId)
      .where('resources.status', '!=', 'deleted')
      .executeTakeFirst();

    if (!resource) throw new AppError(404, 'Tài nguyên không tồn tại');

    // 2. Kiểm tra quyền truy cập folder
    await requireFolderAccess(userId, resource.folder_id, 'view');

    // 3. Ghi Audit Log download (không cần transaction vì không ảnh hưởng nghiệp vụ chính)
    await db.insertInto('audit_logs').values({
      actor_id: userId,
      action: 'resource.download',
      target_type: 'resource',
      target_id: resourceId,
    }).execute();

    // 4. Trả về stream từ Storage Driver
    const stream = await this.storage.getStream(resource.object_key);
    return { stream, filename: resource.name, mimeType: resource.mime_type };
  }

  /**
   * Lấy danh sách resources trong một folder (không đệ quy)
   */
  async listResources(userId: string, folderId: string, options: {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'size_bytes';
  order?: 'asc' | 'desc';
}) {
  // 1. Kiểm tra quyền xem folder
  await requireFolderAccess(userId, folderId, 'view');

  const page = options.page || 1;
  const limit = Math.min(options.limit || 50, 100);
  const offset = (page - 1) * limit;
  const sortBy = options.sortBy || 'created_at';
  const order = options.order || 'desc';

  // 2. Query với Kysely (type-safe)
  const resources = await db.selectFrom('resources')
    .leftJoin('users', 'users.id', 'resources.created_by')
    .select([
      'resources.id',
      'resources.name',
      'resources.type',
      'resources.mime_type',
      'resources.size_bytes',
      'resources.status',
      'resources.created_at',
      'resources.updated_at',
      'users.full_name as created_by_name',
    ])
    .where('resources.folder_id', '=', folderId)
    .where('resources.deleted_at', 'is', null)
    .orderBy(sortBy, order)
    .limit(limit)
    .offset(offset)
    .execute();

  // 3. Đếm tổng số (để pagination)
  const countResult = await db.selectFrom('resources')
    .select(db.fn.count<number>('id').as('total'))
    .where('folder_id', '=', folderId)
    .where('deleted_at', 'is', null)
    .executeTakeFirstOrThrow();

  return {
    data: resources.map(r => ({
      ...r,
      size_bytes: Number(r.size_bytes), // Convert bigint -> number cho JSON
    })),
    pagination: {
      page,
      limit,
      total: Number(countResult.total),
      totalPages: Math.ceil(Number(countResult.total) / limit),
    }
  };
}

/**
 * Lấy thông tin chi tiết 1 resource (kèm versions)
 */
  async getResourceDetail(userId: string, resourceId: string) {
  // 1. Lấy resource + folder + creator
  const resource = await db.selectFrom('resources')
    .innerJoin('folders', 'folders.id', 'resources.folder_id')
    .leftJoin('users', 'users.id', 'resources.created_by')
    .select([
      'resources.id',
      'resources.name',
      'resources.type',
      'resources.mime_type',
      'resources.size_bytes',
      'resources.status',
      'resources.created_at',
      'resources.updated_at',
      'resources.folder_id',
      'folders.name as folder_name',
      'folders.workspace_id',
      'users.full_name as created_by_name',
    ])
    .where('resources.id', '=', resourceId)
    .where('resources.deleted_at', 'is', null)
    .executeTakeFirst();

  if (!resource) throw new AppError(404, 'Tài nguyên không tồn tại');

  // 2. Kiểm tra quyền xem
  await requireFolderAccess(userId, resource.folder_id, 'view');

  // 3. Lấy danh sách versions
  const versions = await db.selectFrom('resource_versions')
    .leftJoin('users', 'users.id', 'resource_versions.created_by')
    .select([
      'resource_versions.id',
      'resource_versions.version_number',
      'resource_versions.original_name',
      'resource_versions.size_bytes',
      'resource_versions.mime_type',
      'resource_versions.created_at',
      'users.full_name as created_by_name',
    ])
    .where('resource_versions.resource_id', '=', resourceId)
    .orderBy('resource_versions.version_number', 'desc')
    .execute();

  // 4. Audit log (view)
  await db.insertInto('audit_logs').values({
    actor_id: userId,
    action: 'resource.view',
    target_type: 'resource',
    target_id: resourceId,
  }).execute();

  return {
    ...resource,
    size_bytes: Number(resource.size_bytes),
    versions: versions.map(v => ({ ...v, size_bytes: Number(v.size_bytes) })),
  };
}

  async moveToTrash(userId: string, resourceId: string) {
  const resource = await db.selectFrom('resources')
    .select(['id', 'folder_id', 'size_bytes'])
    .where('id', '=', resourceId)
    .where('deleted_at', 'is', null)
    .executeTakeFirst();

  if (!resource) throw new AppError(404, 'Tài nguyên không tồn tại');

  await requireFolderAccess(userId, resource.folder_id, 'delete');

  await db.updateTable('resources')
    .set({
      status: 'trashed',
      trashed_at: new Date(),
    })
    .where('id', '=', resourceId)
    .execute();

  // Audit log
  await db.insertInto('audit_logs')
    .values({
      actor_id: userId,
      action: 'resource.trash',
      target_type: 'resource',
      target_id: resourceId,
    })
    .execute();
}

  async restoreFromTrash(userId: string, resourceId: string) {
  const resource = await db.selectFrom('resources')
    .select(['id', 'folder_id'])
    .where('id', '=', resourceId)
    .where('status', '=', 'trashed')
    .executeTakeFirst();

  if (!resource) throw new AppError(404, 'Tài nguyên không tồn tại hoặc chưa bị xóa');

  await requireFolderAccess(userId, resource.folder_id, 'edit');

  await db.updateTable('resources')
    .set({
      status: 'active',
      trashed_at: null,
    })
    .where('id', '=', resourceId)
    .execute();

  // Audit log
  await db.insertInto('audit_logs')
    .values({
      actor_id: userId,
      action: 'resource.restore',
      target_type: 'resource',
      target_id: resourceId,
    })
    .execute();
}

  async listTrash(userId: string) {
  const resources = await db.selectFrom('resources')
    .innerJoin('folders', 'folders.id', 'resources.folder_id')
    .select([
      'resources.id',
      'resources.name',
      'resources.type',
      'resources.mime_type',
      'resources.size_bytes',
      'resources.trashed_at',
      'folders.name as folder_name',
    ])
    .where('resources.status', '=', 'trashed')
    .where('resources.deleted_at', 'is', null)
     .where(accessibleResourceSql(userId))
    .orderBy('resources.trashed_at', 'desc')
    .execute();

  return resources.map(r => ({ ...r, size_bytes: Number(r.size_bytes) }));
}

  async permanentDelete(userId: string, resourceId: string) {
    const resource = await db.selectFrom('resources')
      .select(['id', 'folder_id', 'size_bytes'])
      .where('id', '=', resourceId).where('status', '=', 'trashed')
      .executeTakeFirst();
    if (!resource) throw new AppError(404, 'Tài nguyên không tồn tại hoặc chưa bị xóa');
    await requireFolderAccess(userId, resource.folder_id, 'delete');

    const versions = await db.selectFrom('resource_versions')
      .innerJoin('storage_objects', 'storage_objects.id', 'resource_versions.storage_object_id')
      .select(['storage_objects.id as object_id', 'storage_objects.object_key'])
      .where('resource_versions.resource_id', '=', resourceId).execute();

    const folder = await db.selectFrom('folders').select('workspace_id')
      .where('id', '=', resource.folder_id).executeTakeFirstOrThrow();

    await db.transaction().execute(async (trx) => {
      await trx.updateTable('resources').set({ current_version_id: null })
        .where('id', '=', resourceId).execute();
      await trx.deleteFrom('resource_versions').where('resource_id', '=', resourceId).execute();
      await trx.deleteFrom('resources').where('id', '=', resourceId).execute();
      for (const v of versions) {
        await trx.deleteFrom('storage_objects').where('id', '=', v.object_id).execute();
      }
      await trx.updateTable('storage_quotas')
        .set({ used_bytes: sql`GREATEST(used_bytes - ${Number(resource.size_bytes)}, 0)` })
        .where('scope_type', '=', 'workspace').where('scope_id', '=', folder.workspace_id)
        .execute();
      await trx.insertInto('audit_logs').values({
        actor_id: userId, action: 'resource.permanent_delete',
        target_type: 'resource', target_id: resourceId,
      }).execute();
    });

    // Xóa file sau khi commit (không rollback được nên để cuối)
    for (const v of versions) {
      try { await this.storage.delete(v.object_key); }
      catch (e) { console.error('Orphan file:', v.object_key, e); }
    }
  }
}