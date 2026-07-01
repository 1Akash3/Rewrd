import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { audit, track } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';
import type { Request } from 'express';

export const campaignsRouter = Router();

// All routes require a merchant user; tenant scoping is enforced from the token.
campaignsRouter.use(requireRole('owner', 'branch_manager', 'staff'));

function tenantId(req: Request): string {
  const p = req.principal!;
  if (p.kind !== 'user' || !p.tenantId) throw notFound('No tenant context');
  return p.tenantId;
}

const upsertSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['visit', 'purchase', 'spend', 'referral', 'review', 'social', 'birthday', 'welcome', 'scratch', 'tiered']).default('visit'),
  stampsRequired: z.number().int().min(1).max(50).default(8),
  rewardTitle: z.string().min(2),
  rewardDetail: z.string().optional(),
  rewardValidityD: z.number().int().min(1).max(365).default(30),
  perCustomerDailyLimit: z.number().int().min(0).max(20).default(1),
  cooldownMinutes: z.number().int().min(0).max(1440).default(60),
  requireStaffApproval: z.boolean().default(false),
  geoValidation: z.boolean().default(false),
  branchScope: z.string().default('all'),
  terms: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'ended']).default('active'),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
});

campaignsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const items = await prisma.campaign.findMany({
      where: { tenantId: tenantId(req) },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { cards: true, stampEvents: true, redemptions: true } } },
    });
    ok(res, items);
  }),
);

campaignsRouter.post(
  '/',
  requireRole('owner', 'branch_manager'),
  asyncHandler(async (req, res) => {
    const body = validate(upsertSchema, req.body);
    const tid = tenantId(req);
    const campaign = await prisma.campaign.create({
      data: {
        tenantId: tid,
        ...body,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
      },
    });
    // Auto-provision a store QR for the new campaign.
    await prisma.qRCode.create({ data: { tenantId: tid, campaignId: campaign.id, label: `${campaign.name} — Store QR`, kind: 'store' } });
    await audit({ tenantId: tid, actorId: req.principal!.kind === 'user' ? req.principal!.id : null, action: 'campaign.create', target: campaign.id });
    await track('campaign_created', { tenantId: tid, campaignId: campaign.id, props: { type: campaign.type } });
    ok(res, campaign, 201);
  }),
);

campaignsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const c = await prisma.campaign.findFirst({
      where: { id: req.params.id, tenantId: tenantId(req) },
      include: { qrCodes: true, _count: { select: { cards: true, stampEvents: true, redemptions: true } } },
    });
    if (!c) throw notFound('Campaign not found');
    ok(res, c);
  }),
);

campaignsRouter.patch(
  '/:id',
  requireRole('owner', 'branch_manager'),
  asyncHandler(async (req, res) => {
    const tid = tenantId(req);
    const existing = await prisma.campaign.findFirst({ where: { id: req.params.id, tenantId: tid } });
    if (!existing) throw notFound('Campaign not found');
    const body = validate(upsertSchema.partial(), req.body);
    const c = await prisma.campaign.update({
      where: { id: existing.id },
      data: {
        ...body,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
      },
    });
    await audit({ tenantId: tid, actorId: req.principal!.kind === 'user' ? req.principal!.id : null, action: 'campaign.update', target: c.id });
    ok(res, c);
  }),
);

campaignsRouter.delete(
  '/:id',
  requireRole('owner'),
  asyncHandler(async (req, res) => {
    const tid = tenantId(req);
    const existing = await prisma.campaign.findFirst({ where: { id: req.params.id, tenantId: tid } });
    if (!existing) throw notFound('Campaign not found');
    await prisma.campaign.update({ where: { id: existing.id }, data: { status: 'ended' } });
    await audit({ tenantId: tid, action: 'campaign.end', target: existing.id });
    ok(res, { ended: true });
  }),
);
