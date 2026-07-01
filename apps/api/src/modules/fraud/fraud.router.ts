import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { audit } from '../../lib/events.js';
import { parseJson } from '../../lib/json.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const fraudRouter = Router();
fraudRouter.use(requireRole('owner', 'branch_manager'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

fraudRouter.get(
  '/alerts',
  asyncHandler(async (req, res) => {
    const status = z.enum(['open', 'reviewing', 'dismissed', 'actioned']).optional().parse(req.query.status);
    const alerts = await prisma.fraudAlert.findMany({
      where: { tenantId: tid(req), ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    ok(res, alerts.map((a) => ({ ...a, detail: parseJson(a.detail, {}) })));
  }),
);

fraudRouter.patch(
  '/alerts/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.fraudAlert.findFirst({ where: { id: req.params.id, tenantId: tid(req) } });
    if (!existing) throw notFound('Alert not found');
    const body = validate(z.object({ status: z.enum(['reviewing', 'dismissed', 'actioned']) }), req.body);
    const a = await prisma.fraudAlert.update({ where: { id: existing.id }, data: { status: body.status } });
    await audit({ tenantId: tid(req), action: 'fraud.review', target: a.id, meta: { status: body.status } });
    ok(res, a);
  }),
);

// Audit log viewer for the Fraud & Audit page.
fraudRouter.get(
  '/audit',
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({ where: { tenantId: tid(req) }, orderBy: { createdAt: 'desc' }, take: 200 });
    ok(res, logs.map((l) => ({ ...l, meta: parseJson(l.meta, null) })));
  }),
);
