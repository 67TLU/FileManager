import {db} from '../../config/database.js';
import crypto from 'crypto';
import {AppError} from '../../shared/middlewares/error.middleware.js';

import {hasFolderAccess, requireFolderAccess} from '../../shared/utils/permission.js';


export class FolderService {
  /**
   * Lấy cây thư mục của một workspace.
   * Sử dụng ltree để query toàn bộ cây chỉ với 1 câu SQL.
   */
  async getFolderTree(userId: string, workspaceId: string) {
    // 1. Kiểm tra user có quyền truy cập workspace này không
    // (Phase 1: đơn giản hóa - mọi user đều xem được workspace company)
    const workspace = await db.selectFrom('workspaces')
      .select(['id', 'type', 'name', 'department_id', 'owner_user_id'])
      .where('id', '=', workspaceId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!workspace) throw new AppError(404, 'Workspace không tồn tại');

    // 2. Lấy TẤT CẢ folders trong workspace (ltree giúp query cực nhanh)
    const folders = await db.selectFrom('folders')
      .select(['id', 'name', 'parent_id', 'path', 'depth', 'created_at'])
      .where('workspace_id', '=', workspaceId)
      .where('deleted_at', 'is', null)
      .orderBy('path')
      .execute();

    // 3. Lọc theo quyền truy cập (Phase 1: giữ tất cả, Phase 2 lọc chi tiết)
    // Phase 2: Gọi hasFolderAccess cho từng folder

    // 4. Build cây từ danh sách phẳng (dùng Map để O(n))
    const folderMap = new Map<string, any>();
    const roots: any[] = [];

    // Tạo node cho từng folder
    folders.forEach(f => {
      folderMap.set(f.id, { ...f, children: [] });
    });

    // Build cây
    folders.forEach(f => {
      const node = folderMap.get(f.id);
      if (f.parent_id && folderMap.has(f.parent_id)) {
        folderMap.get(f.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return {
      workspace: { id: workspace.id, name: workspace.name, type: workspace.type },
      tree: roots,
      total: folders.length
    };
  }

  /**
   * Tạo thư mục mới
   */
  async createFolder(userId: string, workspaceId: string, parentId: string | null, name: string) {
    // 1. Kiểm tra quyền tạo folder
    if (parentId) {
      await requireFolderAccess(userId, parentId, 'edit');
    }

    // 2. Kiểm tra workspace tồn tại
    const workspace = await db.selectFrom('workspaces')
      .select('id')
      .where('id', '=', workspaceId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!workspace) throw new AppError(404, 'Workspace không tồn tại');

    // 3. Insert folder (trigger folders_path_trg sẽ tự tính path)
    const folderId = crypto.randomUUID();
    await db.insertInto('folders')
      .values({
        id: folderId,
        workspace_id: workspaceId,
        parent_id: parentId,
        name: name.trim(),
        created_by: userId,
      })
      .execute();

    // 4. Lấy lại folder vừa tạo (có path)
    const folder = await db.selectFrom('folders')
      .select(['id', 'name', 'path', 'depth', 'parent_id'])
      .where('id', '=', folderId)
      .executeTakeFirstOrThrow();

    // 5. Audit log
    await db.insertInto('audit_logs').values({
      actor_id: userId,
      action: 'folder.create',
      target_type: 'folder',
      target_id: folderId,
      metadata: JSON.stringify({ name, workspaceId, parentId }) as any,
    }).execute();

    return folder;
  }
}