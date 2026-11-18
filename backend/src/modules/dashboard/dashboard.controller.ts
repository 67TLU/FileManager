import type { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';

export class DashboardController {
  private dashboardService = new DashboardService();

  getStats = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const stats = await this.dashboardService.getStats(req.user!.id);
        res.json({ success: true, data: stats });
      } catch (error) {
        next(error);
      }
    },
  ];

  getRecentActivity = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const activities = await this.dashboardService.getRecentActivity(req.user!.id, limit);
        res.json({ success: true, data: activities });
      } catch (error) {
        next(error);
      }
    },
  ];

  getStorageTrend = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const months = req.query.months ? Number(req.query.months) : 6;
        const trend = await this.dashboardService.getStorageTrend(req.user!.id, months);
        res.json({ success: true, data: trend });
      } catch (error) {
        next(error);
      }
    },
  ];
}