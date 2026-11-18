import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PositionService } from './position.service.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import {validate} from '../../shared/middlewares/validate.middleware.js';

import {requireFunctionalPermission} from '../../shared/utils/permission.js';


const createPositionSchema = z.object({
  body: z.object({
    code: z.string()
      .min(2)
      .max(30)
      .regex(/^[A-Z0-9_]+$/, 'Mã chỉ chứa chữ hoa, số và dấu _'),
    name: z.string().min(1).max(100),
    level: z.enum(['intern', 'junior', 'staff', 'senior', 'lead', 'manager', 'director', 'cxo']),
    description: z.string().max(500).optional(),
  }),
});

const updatePositionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    level: z.enum(['intern', 'junior', 'staff', 'senior', 'lead', 'manager', 'director', 'cxo']).optional(),
    description: z.string().max(500).optional(),
  }),
});

export class PositionController {
  private positionService = new PositionService();

  list = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'position.view');
        const positions = await this.positionService.listPositions();
        res.json({ success: true, data: positions });
      } catch (error) {
        next(error);
      }
    },
  ];

  getById = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'position.view');
        const position = await this.positionService.getPositionById(req.params.positionId as string);
        res.json({ success: true, data: position });
      } catch (error) {
        next(error);
      }
    },
  ];

  create = [
    validate(createPositionSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'position.manage');
        const position = await this.positionService.createPosition(req.body);
        res.status(201).json({ success: true, data: position });
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    validate(updatePositionSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'position.manage');
        const position = await this.positionService.updatePosition(req.params.positionId as string, req.body);
        res.json({ success: true, data: position });
      } catch (error) {
        next(error);
      }
    },
  ];

  delete = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'position.manage');
        await this.positionService.deletePosition(req.params.positionId as string);
        res.json({ success: true, message: 'Chức vụ đã được xóa' });
      } catch (error) {
        next(error);
      }
    },
  ];
}