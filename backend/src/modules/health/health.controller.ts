import type { Request, Response } from 'express';
import {db} from '../../config/database.js';


export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check DB
    await db.selectFrom('users').select('id').limit(1).execute();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: 'ok',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      checks: { database: 'failed' },
    });
  }
};