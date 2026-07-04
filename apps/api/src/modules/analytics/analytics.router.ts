import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireRole('owner', 'branch_manager'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

const dayStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// Optional per-branch drill-down: every endpoint accepts ?branchId= and
// scopes stamp events (and things derived from them) to that branch.
const branchFilter = (req: any): { branchId?: string } => {
  const b = typeof req.query?.branchId === 'string' && req.query.branchId ? { branchId: req.query.branchId } : {};
  return b;
};

// Headline KPIs for the merchant overview dashboard.
analyticsRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const bf = branchFilter(req);
    const today = dayStart();
    const weekAgo = new Date(Date.now() - 7 * 864e5);
    const monthAgo = new Date(Date.now() - 30 * 864e5);
    const campaignFilter = { campaign: { tenantId }, ...bf };
    // Cards aren't branch-scoped, so branch drill-down selects cards that have
    // at least one stamp collected at that branch.
    const cardBranch = bf.branchId ? { stampEvents: { some: { branchId: bf.branchId } } } : {};

    const [scansToday, scansWeek, scansMonth, activeCustomers, rewardsUnlocked, rewardsClaimed, totalCards, openAlerts] = await Promise.all([
      prisma.stampEvent.count({ where: { ...campaignFilter, status: 'granted', createdAt: { gte: today } } }),
      prisma.stampEvent.count({ where: { ...campaignFilter, status: 'granted', createdAt: { gte: weekAgo } } }),
      prisma.stampEvent.count({ where: { ...campaignFilter, status: 'granted', createdAt: { gte: monthAgo } } }),
      prisma.stampCard.count({ where: { campaign: { tenantId }, lastStampAt: { gte: monthAgo }, ...cardBranch } }),
      prisma.rewardRedemption.count({ where: { campaign: { tenantId }, ...(bf.branchId ? { card: { stampEvents: { some: { branchId: bf.branchId } } } } : {}) } }),
      prisma.rewardRedemption.count({ where: { campaign: { tenantId }, status: 'claimed', ...(bf.branchId ? { card: { stampEvents: { some: { branchId: bf.branchId } } } } : {}) } }),
      prisma.stampCard.count({ where: { campaign: { tenantId }, ...cardBranch } }),
      prisma.fraudAlert.count({ where: { tenantId, status: 'open' } }),
    ]);

    // Repeat customers: cards with more than one granted stamp event.
    const cards = await prisma.stampCard.findMany({ where: { campaign: { tenantId }, ...cardBranch }, select: { stamps: true, cyclesDone: true, campaign: { select: { stampsRequired: true } }, _count: { select: { stampEvents: true } } } });
    const repeatCustomers = cards.filter((c) => c._count.stampEvents > 1).length;
    const completions = cards.reduce((s, c) => s + c.cyclesDone, 0);
    const avgVisits = cards.length ? cards.reduce((s, c) => s + c._count.stampEvents, 0) / cards.length : 0;

    ok(res, {
      scansToday, scansWeek, scansMonth,
      activeCustomers, repeatCustomers, totalCustomers: totalCards,
      rewardsUnlocked, rewardsClaimed, completions,
      redemptionRate: rewardsUnlocked ? Math.round((rewardsClaimed / rewardsUnlocked) * 100) : 0,
      avgVisitsPerCustomer: Math.round(avgVisits * 10) / 10,
      openFraudAlerts: openAlerts,
    });
  }),
);

// Daily scan trend for the last 14 days (for the line chart).
analyticsRouter.get(
  '/trend',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const days = 14;
    const start = dayStart(new Date(Date.now() - (days - 1) * 864e5));
    const events = await prisma.stampEvent.findMany({
      where: { campaign: { tenantId }, status: 'granted', createdAt: { gte: start }, ...branchFilter(req) },
      select: { createdAt: true },
    });
    const buckets: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 864e5);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const e of events) {
      const key = e.createdAt.toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += 1;
    }
    ok(res, Object.entries(buckets).map(([date, scans]) => ({ date, scans })));
  }),
);

// New vs returning + popular visit hours.
analyticsRouter.get(
  '/breakdown',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const events = await prisma.stampEvent.findMany({
      where: { campaign: { tenantId }, status: 'granted', ...branchFilter(req) },
      select: { createdAt: true, customerId: true },
      orderBy: { createdAt: 'asc' },
    });
    const seen = new Set<string>();
    let newUsers = 0, returning = 0;
    const hours = Array.from({ length: 24 }, () => 0);
    for (const e of events) {
      if (seen.has(e.customerId)) returning++; else { newUsers++; seen.add(e.customerId); }
      hours[e.createdAt.getHours()]++;
    }
    ok(res, { newUsers, returning, popularHours: hours.map((count, hour) => ({ hour, count })) });
  }),
);

// Top campaigns by stamp volume.
analyticsRouter.get(
  '/campaigns',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const bf = branchFilter(req);
    const campaigns = await prisma.campaign.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            stampEvents: bf.branchId ? { where: { branchId: bf.branchId } } : true,
            redemptions: true,
            cards: bf.branchId ? { where: { stampEvents: { some: { branchId: bf.branchId } } } } : true,
          },
        },
      },
    });
    ok(res, campaigns
      .map((c) => ({ id: c.id, name: c.name, stamps: c._count.stampEvents, rewards: c._count.redemptions, customers: c._count.cards }))
      .sort((a, b) => b.stamps - a.stamps));
  }),
);
