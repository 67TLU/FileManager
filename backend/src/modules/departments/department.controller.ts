import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import {DepartmentService} from './department.service.js';

import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import {validate} from '../../shared/middlewares/validate.middleware.js';

import {requireFunctionalPermission} from '../../shared/utils/permission.js';


// ============================================================
// VALIDATION SCHEMAS
// ============================================================
const createDepartmentSchema = z.object({
  body: z.object({
    code: z.string()
      .min(2, 'Mã phòng ban ít nhất 2 ký tự')
      .max(20, 'Mã phòng ban tối đa 20 ký tự')
      .regex(/^[A-Z0-9_]+$/, 'Mã chỉ chứa chữ hoa, số và dấu _'),
    name: z.string().min(1, 'Tên phòng ban không được để trống').max(100),
    parentId: z.string().uuid().nullable().optional(),
    managerUserId: z.string().uuid().nullable().optional(),
  }),
});

const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    managerUserId: z.string().uuid().nullable().optional(),
  }),
});

const addMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid('User ID không hợp lệ'),
    isManager: z.boolean().optional().default(false),
  }),
});

// ============================================================
// CONTROLLER
// ============================================================
export class DepartmentController {
  private departmentService = new DepartmentService();

  /**
   * GET /api/v1/departments
   * Lấy danh sách phòng ban (kèm số thành viên)
   */
  list = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.view');
        const departments = await this.departmentService.listDepartments();
        res.json({ success: true, data: departments });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * GET /api/v1/departments/tree
   * Lấy cây phòng ban (hierarchy)
   */
  tree = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.view');
        const tree = await this.departmentService.getDepartmentTree();
        res.json({ success: true, data: tree });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * GET /api/v1/departments/:departmentId
   * Lấy chi tiết phòng ban + danh sách thành viên
   */
  getById = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.view');
        const department = await this.departmentService.getDepartmentById(req.params.departmentId as string);
        res.json({ success: true, data: department });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * POST /api/v1/departments
   * Tạo phòng ban mới
   */
  create = [
    validate(createDepartmentSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        const department = await this.departmentService.createDepartment(req.body);
        res.status(201).json({ success: true, data: department });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * PUT /api/v1/departments/:departmentId
   * Cập nhật thông tin phòng ban
   */
  update = [
    validate(updateDepartmentSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        const department = await this.departmentService.updateDepartment(
          req.params.departmentId as string,
          req.body
        );
        res.json({ success: true, data: department });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * DELETE /api/v1/departments/:departmentId
   * Xóa mềm phòng ban
   */
  delete = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        await this.departmentService.deleteDepartment(req.params.departmentId as string, req.user!.id);
        res.json({ success: true, message: 'Phòng ban đã được xóa' });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * POST /api/v1/departments/:departmentId/members
   * Thêm thành viên vào phòng ban
   */
  addMember = [
    validate(addMemberSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        const { userId, isManager } = req.body;
        await this.departmentService.addMember(
          req.params.departmentId as string,
          userId,
          isManager,
          req.user!.id
        );
        res.status(201).json({ success: true, message: 'Đã thêm thành viên' });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * DELETE /api/v1/departments/:departmentId/members/:userId
   * Xóa thành viên khỏi phòng ban
   */
  removeMember = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        await this.departmentService.removeMember(
          req.params.departmentId as string,
          req.params.userId as string,
          req.user!.id
        );
        res.json({ success: true, message: 'Đã xóa thành viên' });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * PUT /api/v1/departments/:departmentId/members/:userId
   * Cập nhật vai trò thành viên (is_manager)
   */
  updateMemberRole = [
    validate(z.object({
      body: z.object({
        isManager: z.boolean(),
      }),
    })),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'department.manage');
        await this.departmentService.updateMemberRole(
          req.params.departmentId as string,
          req.params.userId as string,
          req.body.isManager,
          req.user!.id
        );
        res.json({ success: true, message: 'Đã cập nhật vai trò' });
      } catch (error) {
        next(error);
      }
    },
  ];
}