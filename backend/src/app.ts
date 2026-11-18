import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import crypto from 'crypto';

import { env } from './config/env.js';
import { initStorageDriver } from './shared/storage/storage.factory.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';
import type { AuthRequest } from './shared/middlewares/auth.middleware.js';
import { authenticate } from './shared/middlewares/auth.middleware.js';
import { apiLimiter, loginLimiter } from './shared/middlewares/rateLimit.middleware.js';

import { AuthController } from './modules/auth/auth.controller.js';
import { UserController } from './modules/users/user.controller.js';
import { MeController } from './modules/users/me.controller.js';
import { DepartmentController } from './modules/departments/department.controller.js';
import { PositionController } from './modules/positions/position.controller.js';
import { ResourceController } from './modules/resources/resource.controller.js';
import { FolderController } from './modules/folders/folder.controller.js';
import { SearchController } from './modules/search/search.controller.js';
import { InvitationController } from './modules/invitations/invitation.controller.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';
import { RolesController } from './modules/roles/roles.controller.js';
import { AuditController } from './modules/audit/audit.controller.js';
import { SettingsController } from './modules/system-settings/settings.controller.js';
import { healthCheck } from './modules/health/health.controller.js';

const app = express();
initStorageDriver(env.STORAGE_DRIVER);

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));
app.set('trust proxy', 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  (req as any).requestId = requestId;
  next();
});

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', apiLimiter);

if (env.STORAGE_DRIVER === 'local') {
  app.use(env.STORAGE_PUBLIC_URL, express.static(path.resolve(env.STORAGE_LOCAL_PATH), {
    dotfiles: 'deny', index: false, maxAge: '1h',
  }));
}

const authController = new AuthController();
const userController = new UserController();
const meController = new MeController();
const departmentController = new DepartmentController();
const positionController = new PositionController();
const resourceController = new ResourceController();
const folderController = new FolderController();
const searchController = new SearchController();
const invitationController = new InvitationController();
const dashboardController = new DashboardController();
const rolesController = new RolesController();
const auditController = new AuditController();
const settingsController = new SettingsController();

// ---------- PUBLIC ----------
app.get('/health', healthCheck);
app.get('/', (_req, res) => res.json({ success: true, message: 'CRMS API is running', version: '1.0.0' }));

app.post('/api/v1/auth/login', loginLimiter, ...(authController.login as any));
app.post('/api/v1/auth/refresh-token', ...(authController.refreshToken as any));
app.post('/api/v1/auth/forgot-password', ...(authController.forgotPassword as any));
app.post('/api/v1/auth/reset-password', ...(authController.resetPassword as any));
app.post('/api/v1/invitations/accept', ...(invitationController.accept as any));
app.get('/api/v1/settings/public', ...(settingsController.getPublic as any));

// ---------- PROTECTED ----------
app.post('/api/v1/auth/logout', authenticate, ...(authController.logout as any));
app.post('/api/v1/auth/change-password', authenticate, ...(authController.changePassword as any));
app.post('/api/v1/auth/logout-all-devices', authenticate, ...(authController.logoutAllDevices as any));

app.get('/api/v1/me', authenticate, meController.getProfile.bind(meController));
app.delete('/api/v1/me/sessions/:sessionId', authenticate, meController.revokeSession.bind(meController));

app.get('/api/v1/users', authenticate, ...(userController.list as any));
app.get('/api/v1/users/:userId', authenticate, ...(userController.getById as any));
app.post('/api/v1/users', authenticate, ...(userController.create as any));
app.put('/api/v1/users/:userId', authenticate, ...(userController.update as any));
app.delete('/api/v1/users/:userId', authenticate, ...(userController.delete as any));
app.put('/api/v1/users/:userId/roles', authenticate, ...(userController.updateRoles as any)); // MỚI

app.get('/api/v1/departments', authenticate, ...(departmentController.list as any));
app.get('/api/v1/departments/tree', authenticate, ...(departmentController.tree as any));
app.get('/api/v1/departments/:departmentId', authenticate, ...(departmentController.getById as any));
app.post('/api/v1/departments', authenticate, ...(departmentController.create as any));
app.put('/api/v1/departments/:departmentId', authenticate, ...(departmentController.update as any));
app.delete('/api/v1/departments/:departmentId', authenticate, ...(departmentController.delete as any));
app.post('/api/v1/departments/:departmentId/members', authenticate, ...(departmentController.addMember as any));
app.put('/api/v1/departments/:departmentId/members/:userId', authenticate, ...(departmentController.updateMemberRole as any));
app.delete('/api/v1/departments/:departmentId/members/:userId', authenticate, ...(departmentController.removeMember as any));

app.get('/api/v1/positions', authenticate, ...(positionController.list as any));
app.get('/api/v1/positions/:positionId', authenticate, ...(positionController.getById as any));
app.post('/api/v1/positions', authenticate, ...(positionController.create as any));
app.put('/api/v1/positions/:positionId', authenticate, ...(positionController.update as any));
app.delete('/api/v1/positions/:positionId', authenticate, ...(positionController.delete as any));

app.get('/api/v1/roles', authenticate, rolesController.list.bind(rolesController));

// Resources: /trash TRƯỚC /:resourceId
app.get('/api/v1/resources', authenticate, ...(resourceController.list as any));
app.get('/api/v1/resources/trash', authenticate, ...(resourceController.listTrash as any));
app.post('/api/v1/resources/upload', authenticate, ...(resourceController.upload as any));
app.get('/api/v1/resources/:resourceId', authenticate, ...(resourceController.getDetail as any));
app.get('/api/v1/resources/:resourceId/download', authenticate, resourceController.download.bind(resourceController));
app.post('/api/v1/resources/:resourceId/trash', authenticate, ...(resourceController.moveToTrash as any));
app.post('/api/v1/resources/:resourceId/restore', authenticate, ...(resourceController.restoreFromTrash as any));
app.delete('/api/v1/resources/:resourceId/permanent', authenticate, ...(resourceController.permanentDelete as any));

app.get('/api/v1/workspaces/:workspaceId/folders', authenticate, folderController.getTree.bind(folderController));
app.post('/api/v1/folders', authenticate, folderController.create.bind(folderController));

app.get('/api/v1/dashboard/stats', authenticate, ...(dashboardController.getStats as any));
app.get('/api/v1/dashboard/activity', authenticate, ...(dashboardController.getRecentActivity as any));
app.get('/api/v1/dashboard/storage-trend', authenticate, ...(dashboardController.getStorageTrend as any));

app.get('/api/v1/search', authenticate, ...(searchController.search as any));
app.get('/api/v1/search/suggestions', authenticate, ...(searchController.suggestions as any));
app.get('/api/v1/search/recent', authenticate, ...(searchController.recent as any));
app.post('/api/v1/search/advanced', authenticate, ...(searchController.advancedSearch as any));

app.get('/api/v1/invitations', authenticate, ...(invitationController.list as any));
app.post('/api/v1/invitations', authenticate, ...(invitationController.create as any));
app.post('/api/v1/invitations/:invitationId/revoke', authenticate, ...(invitationController.revoke as any));

app.get('/api/v1/audit-logs', authenticate, ...(auditController.list as any));
app.get('/api/v1/audit-logs/export', authenticate, ...(auditController.exportCsv as any)); // MỚI

app.get('/api/v1/settings', authenticate, ...(settingsController.getAll as any));
app.get('/api/v1/settings/:key', authenticate, ...(settingsController.getByKey as any));
app.put('/api/v1/settings', authenticate, ...(settingsController.update as any));

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { message: `Route ${req.method} ${req.originalUrl} not found` } });
});
app.use(errorHandler);

export default app;