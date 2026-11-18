import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import {UserService} from './user.service.js';

import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import {validate} from '../../shared/middlewares/validate.middleware.js';

import {requireFunctionalPermission} from '../../shared/utils/permission.js';


const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    positionId: z.string().uuid().optional(),
    departmentIds: z.array(z.string().uuid()).optional(),
    roleIds: z.array(z.string().uuid()).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    positionId: z.string().uuid().nullable().optional(),
    status: z.enum(['active', 'suspended', 'disabled']).optional(),
  }),
});

const listUsersSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

export class UserController {
  private userService = new UserService();
  updateRoles = [
    validate(z.object({ body: z.object({ roleIds: z.array(z.string().uuid()).min(1) }) })),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.assign_role');
        const result = await this.userService.updateUserRoles(
          req.params.userId as string, req.body.roleIds, req.user!.id);
        res.json({ success: true, data: result });
      } catch (e) { next(e); }
    },
  ];
  list = [
    validate(listUsersSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.view');
        const result = await this.userService.listUsers(req.query);
        res.json({ success: true, ...result });
      } catch (error) {
        next(error);
      }
    },
  ];

  getById = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.view');
        const result = await this.userService.getUserById(req.params.userId as string);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  create = [
    validate(createUserSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.create');
        const result = await this.userService.createUser(req.body);
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    validate(updateUserSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.update');
        const result = await this.userService.updateUser(req.params.userId as string, req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  delete = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'user.delete');
        await this.userService.deleteUser(req.params.userId as string);
        res.json({ success: true, message: 'User đã được xóa' });
      } catch (error) {
        next(error);
      }
    },
  ];
}