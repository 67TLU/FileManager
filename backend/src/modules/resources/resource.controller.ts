import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {ResourceService} from './resource.service.js';

import type {AuthRequest} from '../../shared/middlewares/auth.middleware.js';

import {authenticate} from '../../shared/middlewares/auth.middleware.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';

import {validateFile} from '../../shared/utils/fileValidator.js';

import {uploadLimiter} from '../../shared/middlewares/rateLimit.middleware.js';


// Cấu hình Multer: Lưu vào RAM (buffer) để Storage Driver xử lý
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export class ResourceController {
  private resourceService = new ResourceService();

  upload = [
    authenticate,
    uploadLimiter,
    uploadMiddleware,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.file) throw new AppError(400, 'No file provided');
        
        // Validate file trước khi xử lý
        await validateFile(req.file);
        
        const folderId = req.body.folderId;
        if (!folderId) throw new AppError(400, 'Thiếu folderId');
        
        await this.resourceService.uploadFile(req.user!.id, folderId, req.file);
        
        res.status(201).json({ success: true, message: 'Upload successful' });
      } catch (error) {
        next(error);
      }
    },
  ];

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { resourceId } = req.params;
      const { stream, filename, mimeType } = await this.resourceService.downloadFile(resourceId as string, req.user!.id);

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  list = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { folderId, page, limit, sortBy, order } = req.query;
        
        if (!folderId || typeof folderId !== 'string') {
          throw new AppError(400, 'Thiếu tham số folderId');
        }

        const result = await this.resourceService.listResources(req.user!.id, folderId as string, {
          ...(page ? { page: Number(page) } : {}),
          ...(limit ? { limit: Number(limit) } : {}),
          sortBy: sortBy as any,
          order: order as any,
        });

        res.json({ success: true, ...result });
      } catch (error) {
        next(error);
      }
    },
  ];

  getDetail = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { resourceId } = req.params;
        const result = await this.resourceService.getResourceDetail(req.user!.id, resourceId as string);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  moveToTrash = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { resourceId } = req.params;
        await this.resourceService.moveToTrash(req.user!.id, resourceId as string);
        res.json({ success: true, message: 'Đã chuyển vào thùng rác' });
      } catch (error) {
        next(error);
      }
    },
  ];

  restoreFromTrash = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { resourceId } = req.params;
        await this.resourceService.restoreFromTrash(req.user!.id, resourceId as string);
        res.json({ success: true, message: 'Đã khôi phục tài nguyên' });
      } catch (error) {
        next(error);
      }
    },
  ];

  listTrash = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const result = await this.resourceService.listTrash(req.user!.id);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  permanentDelete = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { resourceId } = req.params;
        await this.resourceService.permanentDelete(req.user!.id, resourceId as string);
        res.json({ success: true, message: 'Đã xóa vĩnh viễn' });
      } catch (error) {
        next(error);
      }
    },
  ];
}

export const uploadMiddleware = upload.single('file');