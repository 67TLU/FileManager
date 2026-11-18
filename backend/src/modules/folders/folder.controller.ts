import type { Request, Response, NextFunction } from 'express';
import {FolderService} from './folder.service.js';

import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { z } from 'zod';

const createFolderSchema = z.object({
  workspaceId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  name: z.string().min(1).max(255).regex(/^[^/\\\\\\]+$/, 'Tên không được chứa / hoặc \\'),
});

export class FolderController {
  private folderService = new FolderService();

  async getTree(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const result = await this.folderService.getFolderTree(req.user!.id, workspaceId as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createFolderSchema.parse(req.body);
      const folder = await this.folderService.createFolder(
        req.user!.id,
        validated.workspaceId,
        validated.parentId,
        validated.name
      );
      res.status(201).json({ success: true, data: folder });
    } catch (error) {
      next(error);
    }
  }
}