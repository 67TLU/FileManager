import type { Request, Response, NextFunction } from 'express';
import {env} from '../../config/env.js';


export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  // Xử lý các lỗi đặc biệt
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File quá lớn (tối đa 100MB)';
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Dữ liệu tham chiếu không tồn tại';
  }

  // Log lỗi
  console.error(`[Error] ${new Date().toISOString()} - ${statusCode} - ${message}`);
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};