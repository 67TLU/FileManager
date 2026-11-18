import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import {InvitationService} from './invitation.service.js';

import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import {validate} from '../../shared/middlewares/validate.middleware.js';


const createInvitationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    departmentId: z.string().uuid().optional(),
    positionId: z.string().uuid().optional(),
    roleIds: z.array(z.string().uuid()).min(1, 'Phải chọn ít nhất 1 vai trò'),
  }),
});

const acceptInvitationSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6),
    fullName: z.string().min(1),
  }),
});

export class InvitationController {
  private invitationService = new InvitationService();

  create = [
    validate(createInvitationSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const result = await this.invitationService.createInvitation(req.user!.id, req.body);
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  accept = [
    validate(acceptInvitationSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { token, password, fullName } = req.body;
        const result = await this.invitationService.acceptInvitation(token, password, fullName);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  list = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { status, page, limit } = req.query;
        const result = await this.invitationService.listInvitations({
          status: status as string,
          ...(page ? { page: Number(page) } : {}),
          ...(limit ? { limit: Number(limit) } : {}),
        });
        res.json({ success: true, ...result });
      } catch (error) {
        next(error);
      }
    },
  ];

  revoke = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { invitationId } = req.params;
        const result = await this.invitationService.revokeInvitation(invitationId as string, req.user!.id);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];
}