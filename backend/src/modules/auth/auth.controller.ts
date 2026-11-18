import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {AuthService} from './auth.service.js';

import {validate} from '../../shared/middlewares/validate.middleware.js';

import type {AuthRequest} from '../../shared/middlewares/auth.middleware.js';

import {authenticate} from '../../shared/middlewares/auth.middleware.js';

import {forgotPasswordLimiter} from '../../shared/middlewares/rateLimit.middleware.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';


const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  }),
});

export class AuthController {
  private authService = new AuthService();

  forgotPassword = [
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.body;
        const result = await this.authService.forgotPassword(email, req.ip || '', req.get('user-agent') || '');
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  resetPassword = [
    validate(resetPasswordSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token, newPassword } = req.body;
        const result = await this.authService.resetPassword(token, newPassword, req.ip || '');
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  changePassword = [
    authenticate,
    validate(changePasswordSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const { currentPassword, newPassword } = req.body;
        const result = await this.authService.changePassword(req.user!.id, currentPassword, newPassword);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  logoutAllDevices = [
    authenticate,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const result = await this.authService.logoutAllDevices(req.user!.id);
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];
  login = [
    validate(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password, req.ip || '');
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  refreshToken = [
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
          throw new AppError(400, 'Thiếu refresh token');
        }
        const result = await this.authService.refreshToken(refreshToken, req.ip || '');
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    },
  ];

  logout = [
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
          throw new AppError(400, 'Thiếu refresh token');
        }
        await this.authService.logout(refreshToken);
        res.json({ success: true, message: 'Đăng xuất thành công' });
      } catch (error) {
        next(error);
      }
    },
  ];
}