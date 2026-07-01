import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { audit, track } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const rewardsRouter = Router();

function tenantOf(req: any): string {
  const p = req.principal;
  if (p?.kind !== 'user' || !p.tenantId) throw notFound('No tenant context');
  return p.tenantId;
}

// Staff looks up a redemption by its token (scanned from the customer's phone).
rewardsRouter.get(
  '/lookup/:token',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const tid = tenantOf(req);
    const r = await prisma.rewardRedemption.findUnique({
      where: { token: req.params.token },
      include: { campaign: true, customer: { select: { name: true, phone: true } } },
    });
    if (!r || r.campaign.tenantId !== tid) throw notFound('Reward not found.');
    ok(res, {
      id: r.id, status: r.status, rewardTitle: r.rewardTitle,
      expiresAt: r.expiresAt, campaign: { name: r.campaign.name },
      customer: r.customer, claimedAt: r.claimedAt,
    });
  }),
);

// Staff claims (marks redeemed) a reward — one-time protection + expiry checks.
rewardsRouter.post(
  '/:token/claim',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const tid = tenantOf(req);
    const staffId = (req.principal as { id: string }).id;
    const body = validate(z.object({ notes: z.string().optional() }), req.body);
    const r = await prisma.rewardRedemption.findUnique({ where: { token: req.params.token }, include: { campaign: true } });
    if (!r || r.campaign.tenantId !== tid) throw notFound('Reward not found.');
    if (r.status === 'claimed') throw badRequest('This reward has already been claimed.');
    if (r.status === 'expired' || (r.expiresAt && r.expiresAt < new Date())) {
      await prisma.rewardRedemption.update({ where: { id: r.id }, data: { status: 'expired' } });
      throw badRequest('This reward has expired.');
    }
    const updated = await prisma.rewardRedemption.update({
      where: { id: r.id },
      data: { status: 'claimed', claimedAt: new Date(), claimedById: staffId, notes: body.notes },
    });
    await audit({ tenantId: tid, actorId: staffId, action: 'reward.claim', target: r.id });
    await track('reward_claimed', { tenantId: tid, campaignId: r.campaignId, customerId: r.customerId });
    ok(res, { claimed: true, id: updated.id, claimedAt: updated.claimedAt });
  }),
);

// Merchant list of redemptions (for the Rewards dashboard page).
rewardsRouter.get(
  '/',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const tid = tenantOf(req);
    const status = z.enum(['unlocked', 'claimed', 'expired', 'void']).optional().parse(req.query.status);
    const items = await prisma.rewardRedemption.findMany({
      where: { campaign: { tenantId: tid }, ...(status ? { status } : {}) },
      include: { campaign: { select: { name: true } }, customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    ok(res, items);
  }),
);
