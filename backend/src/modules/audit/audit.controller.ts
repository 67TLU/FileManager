import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import type { AuthRequest } from '../../shared/middlewares/auth.middleware.js';
import { requireFunctionalPermission } from '../../shared/utils/permission.js';
import { validate } from '../../shared/middlewares/validate.middleware.js';

const listAuditLogsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional().default(1),
    limit: z.string().transform(Number).optional().default(50),
    action: z.string().optional(),
    actorId: z.string().uuid().optional(),
    targetType: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
});

export class AuditController {
    exportCsv = [
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'audit.export');
        const { action, actorId, targetType, dateFrom, dateTo } = req.query as any;

        let q = db.selectFrom('audit_logs')
          .leftJoin('users', 'users.id', 'audit_logs.actor_id')
          .select([
            'audit_logs.id', 'audit_logs.occurred_at', 'audit_logs.action',
            'audit_logs.target_type', 'audit_logs.target_id', 'audit_logs.ip',
            'audit_logs.metadata', 'users.email as actor_email',
          ])
          .orderBy('audit_logs.occurred_at', 'desc')
          .limit(10000);

        if (action) q = q.where('audit_logs.action', '=', action);
        if (actorId) q = q.where('audit_logs.actor_id', '=', actorId);
        if (targetType) q = q.where('audit_logs.target_type', '=', targetType);
        if (dateFrom) q = q.where('audit_logs.occurred_at', '>=', new Date(dateFrom));
        if (dateTo) q = q.where('audit_logs.occurred_at', '<=', new Date(dateTo));

        const rows = await q.execute();
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const header = ['id', 'occurred_at', 'actor_email', 'action', 'target_type', 'target_id', 'ip', 'metadata'];
        const csv = [
          header.join(','),
          ...rows.map((r) => [
            r.id, new Date(r.occurred_at as any).toISOString(), r.actor_email,
            r.action, r.target_type, r.target_id, r.ip, JSON.stringify(r.metadata),
          ].map(esc).join(',')),
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
        res.send('\uFEFF' + csv); // BOM cho Excel tiếng Việt
      } catch (e) { next(e); }
    },
  ];
  list = [
    validate(listAuditLogsSchema),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        await requireFunctionalPermission(req.user!.id, 'audit.view');

        const { page, limit, action, actorId, targetType, dateFrom, dateTo } = req.query as any;
        const offset = ((page || 1) - 1) * (limit || 50);

        let query = db.selectFrom('audit_logs')
          .leftJoin('users', 'users.id', 'audit_logs.actor_id')
          .select([
            'audit_logs.id',
            'audit_logs.action',
            'audit_logs.occurred_at',
            'audit_logs.target_type',
            'audit_logs.target_id',
            'audit_logs.ip',
            'audit_logs.metadata',
            'users.full_name as actor_name',
            'users.email as actor_email',
          ])
          .orderBy('audit_logs.occurred_at', 'desc');

        if (action) query = query.where('audit_logs.action', '=', action);
        if (actorId) query = query.where('audit_logs.actor_id', '=', actorId);
        if (targetType) query = query.where('audit_logs.target_type', '=', targetType);
        if (dateFrom) query = query.where('audit_logs.occurred_at', '>=', dateFrom);
        if (dateTo) query = query.where('audit_logs.occurred_at', '<=', dateTo);

        const logs = await query.limit(limit || 50).offset(offset).execute();

        const countResult = await db.selectFrom('audit_logs')
          .select(db.fn.count<number>('id').as('total'))
          .executeTakeFirstOrThrow();

        res.json({
          success: true,
          data: logs,
          pagination: {
            page: page || 1,
            limit: limit || 50,
            total: Number(countResult.total),
            totalPages: Math.ceil(Number(countResult.total) / (limit || 50)),
          },
        });
      } catch (error) {
        next(error);
      }
    },
  ];
}