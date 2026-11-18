import {db} from '../../config/database.js';

import {AppError} from '../middlewares/error.middleware.js';
import { sql } from 'kysely';

/**
 * Kiểm tra user có quyền chức năng (functional permission) hay không.
 * Ví dụ: 'resource.upload', 'folder.create'
 */
export async function hasFunctionalPermission(
  userId: string,
  permissionCode: string,
  scope?: { type: 'global' | 'department' | 'workspace'; id: string }
): Promise<boolean> {
  let query = db.selectFrom('user_roles')
    .innerJoin('role_permissions', 'role_permissions.role_id', 'user_roles.role_id')
    .select('role_permissions.permission_code')
    .where('user_roles.user_id', '=', userId)
    .where('role_permissions.permission_code', '=', permissionCode);

  if (scope) {
    query = query.where((eb) => eb.or([
      eb('user_roles.scope_type', '=', 'global'),
      eb.and([
        eb('user_roles.scope_type', '=', scope.type),
        eb('user_roles.scope_id', '=', scope.id)
      ])
    ]));
  } else {
    query = query.where('user_roles.scope_type', '=', 'global');
  }

  const result = await query.executeTakeFirst();
  return !!result;
}

/**
 * Throw 403 nếu không có quyền chức năng
 */
export async function requireFunctionalPermission(
  userId: string,
  permissionCode: string,
  scope?: { type: 'global' | 'department' | 'workspace'; id: string }
) {
  const has = await hasFunctionalPermission(userId, permissionCode, scope);
  if (!has) {
    throw new AppError(403, `Bạn không có quyền '${permissionCode}'`);
  }
}

/**
 * Kiểm tra user có quyền truy cập vào một FOLDER cụ thể hay không.
 * Logic:
 *  - Admin toàn cục → OK
 *  - Folder thuộc workspace công ty → mọi user active đều OK (Phase 1)
 *  - Folder thuộc workspace phòng ban → user phải là thành viên phòng ban
 *  - Folder thuộc workspace cá nhân → chỉ chủ sở hữu
 *  - Phase 2: Thêm ACL riêng cho folder
 */
export async function hasFolderAccess(
  userId: string,
  folderId: string,
  action: 'view' | 'upload' | 'edit' | 'delete'
): Promise<boolean> {
  // 1. Lấy thông tin folder + workspace
  const folder = await db.selectFrom('folders')
    .innerJoin('workspaces', 'workspaces.id', 'folders.workspace_id')
    .leftJoin('departments', 'departments.id', 'workspaces.department_id')
    .select([
      'folders.id',
      'folders.workspace_id',
      'workspaces.type as workspace_type',
      'workspaces.owner_user_id',
      'workspaces.department_id'
    ])
    .where('folders.id', '=', folderId)
    .where('folders.deleted_at', 'is', null)
    .executeTakeFirst();

  if (!folder) return false;

  // 2. System Admin → OK tất cả
  const isAdmin = await db.selectFrom('user_roles')
    .innerJoin('roles', 'roles.id', 'user_roles.role_id')
    .select('roles.key')
    .where('user_roles.user_id', '=', userId)
    .where('roles.key', '=', 'system_admin')
    .where('user_roles.scope_type', '=', 'global')
    .executeTakeFirst();

  if (isAdmin) return true;

  // 3. Kiểm tra theo loại workspace
  switch (folder.workspace_type) {
    case 'company':
      // Phase 1: Mọi user active đều có quyền view/download
      // Upload/edit/delete cần quyền chức năng
      if (action === 'view') return true;
      return await hasFunctionalPermission(userId, `resource.${action === 'upload' ? 'upload' : action === 'edit' ? 'edit' : 'delete'}`);

    case 'personal':
      // Chỉ chủ sở hữu
      return folder.owner_user_id === userId;

    case 'department':
      // Phải là thành viên phòng ban
      const isMember = await db.selectFrom('department_members')
        .select('user_id')
        .where('department_id', '=', folder.department_id)
        .where('user_id', '=', userId)
        .executeTakeFirst();
      
      if (!isMember) return false;
      
      // Nếu là action mạnh (upload/edit/delete), cần thêm quyền chức năng
      if (action !== 'view') {
        return await hasFunctionalPermission(
          userId,
          `resource.${action}`,
          { type: 'department', id: folder.department_id! }
        );
      }
      return true;

    default:
      return false;
  }
}

/**
 * Throw 403 nếu không có quyền truy cập folder
 */
export async function requireFolderAccess(
  userId: string,
  folderId: string,
  action: 'view' | 'upload' | 'edit' | 'delete'
) {
  const has = await hasFolderAccess(userId, folderId, action);
  if (!has) {
    throw new AppError(403, 'Bạn không có quyền truy cập thư mục này');
  }
}
export function accessibleResourceSql(userId: string) {
  return sql<boolean>`EXISTS (
    SELECT 1 FROM folders f
    JOIN workspaces w ON w.id = f.workspace_id
    WHERE f.id = resources.folder_id
      AND f.deleted_at IS NULL AND w.deleted_at IS NULL
      AND (
        w.type = 'company'
        OR (w.type = 'personal' AND w.owner_user_id = ${userId})
        OR (w.type = 'department' AND EXISTS (
              SELECT 1 FROM department_members dm
              WHERE dm.department_id = w.department_id AND dm.user_id = ${userId}))
        OR EXISTS (
              SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
              WHERE ur.user_id = ${userId} AND r.key = 'system_admin' AND ur.scope_type = 'global')
      )
  )`;
}