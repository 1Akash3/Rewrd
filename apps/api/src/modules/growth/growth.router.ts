import { Router } from 'express';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { track } from '../../lib/events.js';
import { parseJson, toJson } from '../../lib/json.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireCustomer, requireRole } from '../../middleware/auth.js';

const nano = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

// -------- Customer-facing growth actions (review / social / referral) --------
export const growthCustomerRouter = Router();
growthCustomerRouter.use(requireCustomer);

growthCustomerRouter.post(
  '/review',
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ tenantId: z.string(), status: z.enum(['clicked', 'submitted']).default('clicked') }), req.body);
    const r = await prisma.reviewAction.create({ data: { tenantId: body.tenantId, customerId: (req.principal as any).id, status: body.status } });
    await track('review_' + body.status, { tenantId: body.tenantId, customerId: (req.principal as any).id });
    ok(res, r, 201);
  }),
);

growthCustomerRouter.post(
  '/social',
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ tenantId: z.string(), platform: z.enum(['instagram', 'facebook', 'youtube', 'whatsapp']) }), req.body);
    const s = await prisma.socialAction.create({ data: { tenantId: body.tenantId, customerId: (req.principal as any).id, platform: body.platform, status: 'clicked' } });
    await track('social_click', { tenantId: body.tenantId, customerId: (req.principal as any).id, props: { platform: body.platform } });
    ok(res, s, 201);
  }),
);

growthCustomerRouter.post(
  '/referral',
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ tenantId: z.string() }), req.body);
    const ref = await prisma.referral.create({ data: { tenantId: body.tenantId, referrerId: (req.principal as any).id, code: nano() } });
    ok(res, { code: ref.code }, 201);
  }),
);

// -------- Merchant-facing growth dashboards + digital menu --------
export const growthMerchantRouter = Router();
growthMerchantRouter.use(requireRole('owner', 'branch_manager'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

growthMerchantRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const [reviewClicks, reviewsSubmitted, socialClicks, referrals] = await Promise.all([
      prisma.reviewAction.count({ where: { tenantId } }),
      prisma.reviewAction.count({ where: { tenantId, status: 'submitted' } }),
      prisma.socialAction.count({ where: { tenantId } }),
      prisma.referral.count({ where: { tenantId } }),
    ]);
    ok(res, {
      reviewClicks, reviewsSubmitted,
      reviewConversion: reviewClicks ? Math.round((reviewsSubmitted / reviewClicks) * 100) : 0,
      socialClicks, referrals,
    });
  }),
);

// Digital menu CRUD (+ tiny AI generator stub).
growthMerchantRouter.get(
  '/menu',
  asyncHandler(async (req, res) => {
    const menu = await prisma.digitalMenu.findFirst({ where: { tenantId: tid(req) }, orderBy: { createdAt: 'desc' } });
    ok(res, menu ? { ...menu, items: parseJson(menu.items, []) } : null);
  }),
);

growthMerchantRouter.post(
  '/menu',
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({ title: z.string().default('Menu'), items: z.array(z.object({ name: z.string(), price: z.number(), desc: z.string().optional(), category: z.string().optional() })) }),
      req.body,
    );
    const menu = await prisma.digitalMenu.create({ data: { tenantId: tid(req), title: body.title, items: toJson(body.items) } });
    ok(res, { ...menu, items: body.items }, 201);
  }),
);

// AI menu generation stub — deterministic scaffold from a text description.
growthMerchantRouter.post(
  '/menu/ai',
  asyncHandler(async (req, res) => {
    const { description, businessType } = validate(z.object({ description: z.string().min(3), businessType: z.string().default('cafe') }), req.body);
    const templates: Record<string, any[]> = {
      cafe: [
        { name: 'Cappuccino', price: 150, category: 'Coffee' },
        { name: 'Cold Brew', price: 180, category: 'Coffee' },
        { name: 'Veg Sandwich', price: 160, category: 'Food' },
        { name: 'Choco Brownie', price: 120, category: 'Dessert' },
      ],
      salon: [
        { name: 'Haircut', price: 300, category: 'Hair' },
        { name: 'Hair Spa', price: 900, category: 'Hair' },
        { name: 'Manicure', price: 500, category: 'Nails' },
      ],
    };
    const items = (templates[businessType as string] ?? templates.cafe).map((i: any) => ({ ...i, desc: `${i.name} — ${description.slice(0, 40)}` }));
    const menu = await prisma.digitalMenu.create({ data: { tenantId: tid(req), title: 'AI Generated Menu', items: toJson(items), aiGenerated: true } });
    ok(res, { ...menu, items }, 201);
  }),
);
