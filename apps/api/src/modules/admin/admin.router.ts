import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { audit } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

// Platform super-admin console (cross-tenant).
export const adminRouter = Router();
adminRouter.use(requireRole('superadmin'));

adminRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const [tenants, activeTenants, customers, stamps, rewards, mrrPlans] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'active' } }),
      prisma.customer.count(),
      prisma.stampEvent.count({ where: { status: 'granted' } }),
      prisma.rewardRedemption.count(),
      prisma.subscription.findMany({ where: { status: 'active' }, include: { plan: true } }),
    ]);
    const arr = mrrPlans.reduce((s, sub) => s + sub.plan.priceYearly, 0);
    ok(res, { tenants, activeTenants, trialTenants: tenants - activeTenants, customers, stamps, rewards, annualRecurringRevenue: arr });
  }),
);

adminRouter.get(
  '/tenants',
  asyncHandler(async (_req, res) => {
    const tenants = await prisma.tenant.findMany({
      include: { subscription: { include: { plan: true } }, _count: { select: { branches: true, campaigns: true, users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, tenants);
  }),
);

adminRouter.patch(
  '/tenants/:id',
  asyncHandler(async (req, res) => {
    const t = await prisma.tenant.findUnique({ where: { id: req.params.id } });
    if (!t) throw notFound('Tenant not found');
    const body = validate(z.object({ status: z.enum(['trial', 'active', 'past_due', 'suspended', 'cancelled']).optional(), kycStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional() }), req.body);
    const updated = await prisma.tenant.update({ where: { id: t.id }, data: body });
    await audit({ actorId: (req.principal as any).id, action: 'admin.tenant.update', target: t.id, meta: body });
    ok(res, updated);
  }),
);

// Cross-tenant fraud review queue.
adminRouter.get(
  '/fraud',
  asyncHandler(async (_req, res) => {
    const alerts = await prisma.fraudAlert.findMany({ where: { status: 'open' }, include: { tenant: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
    ok(res, alerts);
  }),
);
