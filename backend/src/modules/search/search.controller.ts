import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import {SearchService} from './search.service.js';

import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import {validate} from '../../shared/middlewares/validate.middleware.js';


// ============================================================
// VALIDATION SCHEMAS
// ============================================================
const searchSchema = z.object({
  query: z.object({
    q: z.string().max(200, 'Từ khóa tối đa 200 ký tự').optional(),
    type: z.enum(['file', 'folder', 'link', 'note']).optional(),
    mimeType: z.string().optional(),
    folderId: z.string().uuid().optional(),
    createdBy: z.string().uuid().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    sizeMin: z.string().transform(Number).optional(),
    sizeMax: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional().default(1),
    limit: z.string().transform(Number).optional().default(20),
    sortBy: z.enum(['name', 'created_at', 'size_bytes', 'updated_at']).optional().default('created_at'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

const advancedSearchSchema = z.object({
  body: z.object({
    query: z.string().max(200).optional(),
    filters: z.object({
      types: z.array(z.enum(['file', 'folder', 'link', 'note'])).optional(),
      mimeTypes: z.array(z.string()).optional(),
      folderIds: z.array(z.string().uuid()).optional(),
      createdBy: z.array(z.string().uuid()).optional(),
      dateRange: z.object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }).optional(),
      sizeRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    }).optional(),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
  }),
});

// ============================================================
// CONTROLLER
// ============================================================
export class SearchController {
  private searchService = new SearchService();

  /**
   * GET /api/v1/search
   * Tìm kiếm cơ bản (query string)
   */
  search = [
    validate(searchSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { q, type, folderId, page, limit } = req.query as any;
        const result = await this.searchService.searchResources(req.user!.id, q ?? '', {
          type, folderId,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 20,
        });
        res.json({ success: true, ...result });   // ← dòng bị thiếu
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * POST /api/v1/search/advanced
   * Tìm kiếm nâng cao (filter phức tạp)
   */
  advancedSearch = [
    validate(advancedSearchSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const result = await this.searchService.advancedSearch(req.user!.id, req.body);
        res.json({ success: true, ...result });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * GET /api/v1/search/suggestions
   * Gợi ý từ khóa tìm kiếm (autocomplete)
   */
  suggestions = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.length < 2) {
          return res.json({ success: true, data: [] });
        }
        const suggestions = await this.searchService.getSuggestions(req.user!.id, q);
        res.json({ success: true, data: suggestions });
      } catch (error) {
        next(error);
      }
    },
  ];

  /**
   * GET /api/v1/search/recent
   * Tài nguyên truy cập gần đây (của user)
   */
  recent = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const recent = await this.searchService.getRecentResources(req.user!.id, limit);
        res.json({ success: true, data: recent });
      } catch (error) {
        next(error);
      }
    },
  ];
}