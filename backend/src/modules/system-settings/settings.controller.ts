import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { SettingsService } from './settings.service.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';
import { requireFunctionalPermission } from '../../shared/utils/permission.js';

const updateSettingsSchema = z.object({
  body: z.object({
    settings: z.record(z.string(), z.any()),
  }),
});

export class SettingsController {
  private settingsService = new SettingsService();

  getAll = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'system.settings');
        const settings = await this.settingsService.getAllSettings();
        res.json({ success: true, data: settings });
      } catch (error) {
        next(error);
      }
    },
  ];

  getPublic = [
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const settings = await this.settingsService.getPublicSettings();
        res.json({ success: true, data: settings });
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    validate(updateSettingsSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'system.settings');
        const result = await this.settingsService.updateSettings(
          req.body.settings,
          req.user!.id
        );
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  getByKey = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'system.settings');
        const setting = await this.settingsService.getSettingByKey(req.params.key as string);
        res.json({ success: true, data: setting });
      } catch (error) {
        next(error);
      }
    },
  ];
}