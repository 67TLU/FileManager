import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { AppError } from './error.middleware.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: any; query?: any; params?: any };

      if (parsed.body !== undefined) req.body = parsed.body;
      // Express 5: req.query là getter-only → mutate object, không gán lại
      if (parsed.query !== undefined) Object.assign(req.query, parsed.query);
      if (parsed.params !== undefined) Object.assign(req.params, parsed.params);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return next(new AppError(400, 'Validation failed', details));
      }
      next(error);
    }
  };
};