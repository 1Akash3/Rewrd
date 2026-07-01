import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { track } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { requireCustomer, requireRole } from '../../middleware/auth.js';
import { evaluateStamp, raiseAlert } from './fraud.js';

export const stampsRouter = Router();

const earnSchema = z.object({
  token: z.string(), // QR token
  campaignId: z.string(),
  deviceFp: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Core: a logged-in customer earns a stamp by scanning a QR.
stampsRouter.post(
  '/earn',
  requireCustomer,
  rateLimit({ windowMs: 60_000, max: 30, key: (r) => (r.principal?.kind === 'customer' ? r.principal.id : r.ip) as string }),
  asyncHandler(async (req, res) => {
    const body = validate(earnSchema, req.body);
    const customerId = (req.principal as { id: string }).id;

    const qr = await prisma.qRCode.findUnique({ where: { token: body.token }, include: { branch: true } });
    if (!qr || qr.status !== 'active') throw badRequest('Invalid or inactive QR code.');

    const campaign = await prisma.campaign.findFirst({ where: { id: body.campaignId, tenantId: qr.tenantId } });
    if (!campaign) throw notFound('Campaign not found for this store.');
    if (campaign.status !== 'active') throw badRequest('This loyalty program is not currently active.');

    // Find or create the customer's card for this campaign (enrollment).
    const card = await prisma.stampCard.upsert({
      where: { customerId_campaignId: { customerId, campaignId: campaign.id } },
      update: {},
      create: { customerId, campaignId: campaign.id },
    });

    // Fraud evaluation.
    const verdict = await evaluateStamp({
      tenantId: qr.tenantId,
      campaign,
      customerId,
      branch: qr.branch,
      deviceFp: body.deviceFp,
      lat: body.lat,
      lng: body.lng,
    });

    if (!verdict.allowed) {
      await prisma.stampEvent.create({
        data: {
          cardId: card.id, customerId, campaignId: campaign.id, branchId: qr.branchId, qrId: qr.id,
          delta: 0, status: 'rejected', deviceFp: body.deviceFp, lat: body.lat, lng: body.lng, reason: verdict.reason,
        },
      });
      await raiseAlert({ tenantId: qr.tenantId, kind: verdict.reason ?? 'blocked', severity: verdict.severity ?? 'medium', detail: { customerId, campaignId: campaign.id, branchId: qr.branchId } });
      await track('stamp_rejected', { tenantId: qr.tenantId, campaignId: campaign.id, branchId: qr.branchId, customerId, props: { reason: verdict.reason } });
      throw badRequest(verdict.message ?? 'Stamp could not be granted.', { reason: verdict.reason });
    }

    // Staff approval flow — create a pending event and stop here.
    if (campaign.requireStaffApproval) {
      const pending = await prisma.stampEvent.create({
        data: { cardId: card.id, customerId, campaignId: campaign.id, branchId: qr.branchId, qrId: qr.id, delta: 1, status: 'pending', deviceFp: body.deviceFp, lat: body.lat, lng: body.lng },
      });
      await track('stamp_pending', { tenantId: qr.tenantId, campaignId: campaign.id, branchId: qr.branchId, customerId });
      return ok(res, { status: 'pending', eventId: pending.id, message: 'Show this to staff to confirm your stamp.' });
    }

    const result = await grantStamp({ cardId: card.id, customerId, campaign, branchId: qr.branchId, qrId: qr.id, deviceFp: body.deviceFp, lat: body.lat, lng: body.lng, tenantId: qr.tenantId });
    ok(res, result, 201);
  }),
);

// Staff approves a pending stamp (staff QR / manual confirmation).
stampsRouter.post(
  '/:eventId/approve',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const p = req.principal as { id: string; tenantId: string | null };
    const ev = await prisma.stampEvent.findUnique({ where: { id: req.params.eventId }, include: { campaign: true } });
    if (!ev || ev.campaign.tenantId !== p.tenantId) throw notFound('Stamp request not found.');
    if (ev.status !== 'pending') throw badRequest('This stamp is not pending approval.');

    await prisma.stampEvent.update({ where: { id: ev.id }, data: { status: 'granted', staffId: p.id } });
    const card = await prisma.stampCard.findUnique({ where: { id: ev.cardId } });
    const result = await applyProgress(card!, ev.campaign, ev.delta);
    ok(res, result);
  }),
);

// Shared internal: record a granted stamp event + advance the card, unlocking a reward if threshold met.
async function grantStamp(args: {
  cardId: string; customerId: string; campaign: any; branchId: string | null; qrId: string | null;
  deviceFp?: string; lat?: number; lng?: number; tenantId: string;
}) {
  await prisma.stampEvent.create({
    data: { cardId: args.cardId, customerId: args.customerId, campaignId: args.campaign.id, branchId: args.branchId, qrId: args.qrId, delta: 1, status: 'granted', deviceFp: args.deviceFp, lat: args.lat, lng: args.lng },
  });
  if (args.deviceFp) {
    await prisma.deviceProfile.upsert({
      where: { fingerprint: args.deviceFp },
      update: { lastSeenAt: new Date(), customerId: args.customerId },
      create: { fingerprint: args.deviceFp, customerId: args.customerId },
    });
  }
  await track('stamp_granted', { tenantId: args.tenantId, campaignId: args.campaign.id, branchId: args.branchId, customerId: args.customerId });
  const card = await prisma.stampCard.findUnique({ where: { id: args.cardId } });
  return applyProgress(card!, args.campaign, 1);
}

// Advance stamp count and unlock a reward when the threshold is reached.
async function applyProgress(card: any, campaign: any, delta: number) {
  let stamps = card.stamps + delta;
  let unlocked = null as null | { id: string; token: string; rewardTitle: string; expiresAt: Date | null };
  let cyclesDone = card.cyclesDone;

  if (stamps >= campaign.stampsRequired) {
    stamps = stamps - campaign.stampsRequired;
    cyclesDone += 1;
    const redemption = await prisma.rewardRedemption.create({
      data: {
        cardId: card.id, customerId: card.customerId, campaignId: campaign.id,
        rewardTitle: campaign.rewardTitle, status: 'unlocked',
        expiresAt: new Date(Date.now() + campaign.rewardValidityD * 864e5),
      },
    });
    unlocked = { id: redemption.id, token: redemption.token, rewardTitle: redemption.rewardTitle, expiresAt: redemption.expiresAt };
    await track('reward_unlocked', { tenantId: campaign.tenantId, campaignId: campaign.id, customerId: card.customerId });
  }

  const updated = await prisma.stampCard.update({
    where: { id: card.id },
    data: { stamps, cyclesDone, lastStampAt: new Date(), status: 'active' },
  });

  return {
    status: 'granted',
    card: { id: updated.id, stamps: updated.stamps, stampsRequired: campaign.stampsRequired, cyclesDone: updated.cyclesDone },
    rewardUnlocked: unlocked,
  };
}
