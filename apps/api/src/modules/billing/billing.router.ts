import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { audit, track } from '../../lib/events.js';
import { parseJson, toJson } from '../../lib/json.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const billingRouter = Router();

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

// Public: list plans (used by pricing page + upgrade flow).
billingRouter.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    const plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceYearly: 'asc' } });
    ok(res, plans.map((p) => ({ ...p, features: parseJson(p.features, {}) })));
  }),
);

billingRouter.use(requireRole('owner'));

billingRouter.get(
  '/subscription',
  asyncHandler(async (req, res) => {
    const sub = await prisma.subscription.findUnique({ where: { tenantId: tid(req) }, include: { plan: true } });
    ok(res, sub ? { ...sub, plan: { ...sub.plan, features: parseJson(sub.plan.features, {}) } } : null);
  }),
);

// Subscribe / upgrade — simulates payment, issues a GST invoice.
billingRouter.post(
  '/subscribe',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const body = validate(z.object({ planCode: z.string(), couponCode: z.string().optional() }), req.body);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { code: body.planCode } });
    if (!plan) throw badRequest('Unknown plan');

    let amount = plan.priceYearly;
    if (body.couponCode === 'WELCOME20') amount = Math.round(amount * 0.8);
    const gst = Math.round(amount * 0.18);

    await prisma.subscription.upsert({
      where: { tenantId },
      update: { planId: plan.id, status: 'active', couponCode: body.couponCode, renewsAt: new Date(Date.now() + 365 * 864e5) },
      create: { tenantId, planId: plan.id, status: 'active', couponCode: body.couponCode, renewsAt: new Date(Date.now() + 365 * 864e5) },
    });
    await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'active' } });

    const count = await prisma.billingInvoice.count();
    const invoice = await prisma.billingInvoice.create({
      data: {
        tenantId, number: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`,
        amount, gstAmount: gst, status: 'paid', paidAt: new Date(),
        lineItems: toJson([{ desc: `${plan.name} plan — annual`, amount }, { desc: 'GST @ 18%', amount: gst }]),
      },
    });
    await audit({ tenantId, action: 'billing.subscribe', target: plan.code });
    await track('trial_converted', { tenantId, props: { plan: plan.code } });
    ok(res, { subscribed: true, invoice: { ...invoice, lineItems: parseJson(invoice.lineItems, []) } }, 201);
  }),
);

billingRouter.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const invoices = await prisma.billingInvoice.findMany({ where: { tenantId: tid(req) }, orderBy: { issuedAt: 'desc' } });
    ok(res, invoices.map((i) => ({ ...i, lineItems: parseJson(i.lineItems, []) })));
  }),
);

billingRouter.post(
  '/cancel',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    await prisma.subscription.update({ where: { tenantId }, data: { status: 'cancelled' } });
    await audit({ tenantId, action: 'billing.cancel' });
    ok(res, { cancelled: true });
  }),
);
