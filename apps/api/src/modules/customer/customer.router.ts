import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { track } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireCustomer } from '../../middleware/auth.js';

export const customerRouter = Router();
customerRouter.use(requireCustomer);

const meId = (req: any): string => req.principal.id;

// All loyalty cards for the logged-in customer with progress + brand info.
customerRouter.get(
  '/cards',
  asyncHandler(async (req, res) => {
    const cards = await prisma.stampCard.findMany({
      where: { customerId: meId(req) },
      include: { campaign: { include: { tenant: { select: { id: true, name: true, slug: true, brandColor: true, logoUrl: true } } } } },
      orderBy: { lastStampAt: 'desc' },
    });
    ok(res, cards.map((c) => ({
      id: c.id,
      stamps: c.stamps,
      stampsRequired: c.campaign.stampsRequired,
      cyclesDone: c.cyclesDone,
      lastStampAt: c.lastStampAt,
      campaign: { id: c.campaign.id, name: c.campaign.name, rewardTitle: c.campaign.rewardTitle, type: c.campaign.type },
      brand: c.campaign.tenant,
    })));
  }),
);

// Reward wallet — unlocked + claimed rewards.
customerRouter.get(
  '/rewards',
  asyncHandler(async (req, res) => {
    const rewards = await prisma.rewardRedemption.findMany({
      where: { customerId: meId(req) },
      include: { campaign: { include: { tenant: { select: { name: true, brandColor: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, rewards.map((r) => ({
      id: r.id, token: r.token, status: r.status, rewardTitle: r.rewardTitle,
      expiresAt: r.expiresAt, claimedAt: r.claimedAt,
      brand: r.campaign.tenant.name, brandColor: r.campaign.tenant.brandColor,
      campaign: r.campaign.name,
    })));
  }),
);

// Scan/stamp history.
customerRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    const events = await prisma.stampEvent.findMany({
      where: { customerId: meId(req), status: 'granted' },
      include: { campaign: { select: { name: true } }, branch: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    ok(res, events);
  }),
);

// Update profile (name, email, birthday, consent).
customerRouter.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        birthday: z.string().datetime().optional(),
        anniversary: z.string().datetime().optional(),
        locale: z.string().optional(),
        consent: z.boolean().optional(),
      }),
      req.body,
    );
    const c = await prisma.customer.update({
      where: { id: meId(req) },
      data: {
        name: body.name, email: body.email,
        birthday: body.birthday ? new Date(body.birthday) : undefined,
        anniversary: body.anniversary ? new Date(body.anniversary) : undefined,
        locale: body.locale,
        consentAt: body.consent === true ? new Date() : body.consent === false ? null : undefined,
      },
    });
    ok(res, { id: c.id, name: c.name, email: c.email, birthday: c.birthday, consentAt: c.consentAt });
  }),
);

// GDPR-style data export for the customer.
customerRouter.get(
  '/me/export',
  asyncHandler(async (req, res) => {
    const id = meId(req);
    const [customer, cards, rewards, events] = await Promise.all([
      prisma.customer.findUnique({ where: { id } }),
      prisma.stampCard.findMany({ where: { customerId: id } }),
      prisma.rewardRedemption.findMany({ where: { customerId: id } }),
      prisma.stampEvent.findMany({ where: { customerId: id } }),
    ]);
    ok(res, { customer, cards, rewards, events });
  }),
);

// GDPR-style deletion request (soft: strips PII, keeps aggregate rows anonymous).
customerRouter.delete(
  '/me',
  asyncHandler(async (req, res) => {
    const id = meId(req);
    await prisma.customer.update({
      where: { id },
      data: { name: null, email: null, birthday: null, anniversary: null, phone: null, consentAt: null },
    });
    await track('customer_deletion', { customerId: id });
    ok(res, { deleted: true });
  }),
);
