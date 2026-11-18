import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {env} from '../../config/env.js';

import {AppError} from './error.middleware.js';


export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized: Missing token'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = (jwt as any).verify(token, (env as any).JWT_ACCESS_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return next(new AppError(401, 'Unauthorized: Invalid or expired token'));
  }
};