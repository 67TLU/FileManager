import crypto from 'crypto';
import {db} from '../../config/database.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';


export class DepartmentService {
  async listDepartments() {
    const departments = await db.selectFrom('departments')
      .leftJoin('users', 'users.id', 'departments.manager_user_id')
      .select([
        'departments.id',
        'departments.code',
        'departments.name',
        'departments.parent_id',
        'departments.manager_user_id',
        'users.full_name as manager_name',
        'departments.created_at',
      ])
      .where('departments.deleted_at', 'is', null)
      .orderBy('departments.name')
      .execute();

    // Đếm số thành viên
    const memberCounts = await db.selectFrom('department_members')
      .select([
        'department_id',
        db.fn.count<number>('user_id').as('member_count'),
      ])
      .groupBy('department_id')
      .execute();

    const countMap = new Map(memberCounts.map(m => [m.department_id, Number(m.member_count)]));

    return departments.map(d => ({
      ...d,
      member_count: countMap.get(d.id) || 0,
    }));
  }

  async getDepartmentById(departmentId: string) {
    const department = await db.selectFrom('departments')
      .leftJoin('users', 'users.id', 'departments.manager_user_id')
      .select([
        'departments.id',
        'departments.code',
        'departments.name',
        'departments.parent_id',
        'departments.manager_user_id',
        'users.full_name as manager_name',
        'departments.created_at',
      ])
      .where('departments.id', '=', departmentId)
      .where('departments.deleted_at', 'is', null)
      .executeTakeFirst();

    if (!department) throw new AppError(404, 'Phòng ban không tồn tại');

    // Lấy members
    const members = await db.selectFrom('department_members')
      .innerJoin('users', 'users.id', 'department_members.user_id')
      .leftJoin('positions' as any, 'positions.id', 'users.position_id')
      .select([
        'users.id',
        'users.email',
        'users.full_name',
        'positions.name as position_name',
        'department_members.is_manager',
        'department_members.joined_at',
      ])
      .where('department_members.department_id', '=', departmentId)
      .execute();

    return { ...department, members };
  }

  async createDepartment(data: {
    code: string;
    name: string;
    parentId?: string;
    managerUserId?: string;
  }) {
    // Kiểm tra code đã tồn tại chưa
    const existing = await db.selectFrom('departments')
      .select('id')
      .where('code', '=', data.code)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (existing) throw new AppError(409, 'Mã phòng ban đã tồn tại');

    const departmentId = crypto.randomUUID();

    await db.insertInto('departments')
      .values({
        id: departmentId,
        code: data.code,
        name: data.name,
        parent_id: data.parentId,
        manager_user_id: data.managerUserId,
      })
      .execute();

    // Tạo workspace cho phòng ban
    await db.insertInto('workspaces')
      .values({
        id: crypto.randomUUID(),
        type: 'department',
        name: data.name,
        department_id: departmentId,
      })
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'department.create',
        target_type: 'department',
        target_id: departmentId,
        metadata: JSON.stringify(data) as any,
      })
      .execute();

    return this.getDepartmentById(departmentId);
  }

  async addMember(departmentId: string, userId: string, isManager: boolean = false, actorId?: string) {
    // Kiểm tra department và user tồn tại
    const dept = await db.selectFrom('departments').select('id').where('id', '=', departmentId).executeTakeFirst();
    if (!dept) throw new AppError(404, 'Phòng ban không tồn tại');

    const user = await db.selectFrom('users').select('id').where('id', '=', userId).where('deleted_at', 'is', null).executeTakeFirst();
    if (!user) throw new AppError(404, 'User không tồn tại');

    await db.insertInto('department_members')
      .values({
        department_id: departmentId,
        user_id: userId,
        is_manager: isManager,
      })
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'department.add_member',
        target_type: 'department',
        target_id: departmentId,
        metadata: JSON.stringify({ userId, isManager, actorId }) as any,
      })
      .execute();
  }

  async removeMember(departmentId: string, userId: string, actorId?: string) {
    await db.deleteFrom('department_members')
      .where('department_id', '=', departmentId)
      .where('user_id', '=', userId)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'department.remove_member',
        target_type: 'department',
        target_id: departmentId,
        metadata: JSON.stringify({ userId, actorId }) as any,
      })
      .execute();
  }

  async getDepartmentTree() {
    const departments = await db.selectFrom('departments')
      .select(['id', 'code', 'name', 'parent_id', 'manager_user_id', 'created_at'])
      .where('deleted_at', 'is', null)
      .orderBy('name')
      .execute();

    // Build tree
    const deptMap = new Map<string, any>();
    const roots: any[] = [];

    departments.forEach(d => {
      deptMap.set(d.id, { ...d, children: [] });
    });

    departments.forEach(d => {
      const node = deptMap.get(d.id);
      if (d.parent_id && deptMap.has(d.parent_id)) {
        deptMap.get(d.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async updateDepartment(departmentId: string, data: {
    name?: string;
    managerUserId?: string;
  }) {
    const department = await db.selectFrom('departments')
      .select('id')
      .where('id', '=', departmentId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!department) throw new AppError(404, 'Phòng ban không tồn tại');

    await db.updateTable('departments')
      .set({
        ...(data.name && { name: data.name }),
        ...(data.managerUserId !== undefined && { manager_user_id: data.managerUserId }),
      })
      .where('id', '=', departmentId)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'department.update',
        target_type: 'department',
        target_id: departmentId,
        metadata: JSON.stringify(data) as any,
      })
      .execute();

    return this.getDepartmentById(departmentId);
  }

  async deleteDepartment(departmentId: string, actorId?: string) {
    const dept = await db.selectFrom('departments').select('id')
      .where('id', '=', departmentId).where('deleted_at', 'is', null).executeTakeFirst();
    if (!dept) throw new AppError(404, 'Phòng ban không tồn tại');

    const child = await db.selectFrom('departments').select('id')
      .where('parent_id', '=', departmentId).where('deleted_at', 'is', null).executeTakeFirst();
    if (child) throw new AppError(400, 'Không thể xóa phòng ban còn có phòng ban con');

    const member = await db.selectFrom('department_members').select('user_id')
      .where('department_id', '=', departmentId).executeTakeFirst();
    if (member) throw new AppError(400, 'Vui lòng chuyển hết thành viên trước khi xóa');

    await db.transaction().execute(async (trx) => {
      await trx.updateTable('departments').set({ deleted_at: new Date() })
        .where('id', '=', departmentId).execute();
      await trx.updateTable('workspaces').set({ deleted_at: new Date() })
        .where('department_id', '=', departmentId).where('type', '=', 'department').execute();
      await trx.insertInto('audit_logs').values({
        actor_id: actorId ?? null, action: 'department.delete',
        target_type: 'department', target_id: departmentId,
      }).execute();
    });
  }

  async updateMemberRole(departmentId: string, userId: string, isManager: boolean, actorId?: string) {
    const member = await db.selectFrom('department_members')
      .select(['department_id', 'user_id']) 
      .where('department_id', '=', departmentId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!member) throw new AppError(404, 'Thành viên không tồn tại trong phòng ban');

    await db.updateTable('department_members')
      .set({ is_manager: isManager })
      .where('department_id', '=', departmentId)
      .where('user_id', '=', userId)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        action: 'department.update_member_role',
        target_type: 'department',
        target_id: departmentId,
        metadata: JSON.stringify({ userId, isManager, actorId }) as any,
      })
      .execute();
  }
}