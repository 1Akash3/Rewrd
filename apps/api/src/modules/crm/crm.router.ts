import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const crmRouter = Router();
crmRouter.use(requireRole('owner', 'branch_manager', 'support'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

// Derive a lifecycle tag from activity.
function tagFor(lastVisit: Date | null, visits: number, nearReward: boolean): string {
  const days = lastVisit ? (Date.now() - lastVisit.getTime()) / 864e5 : Infinity;
  if (visits === 0) return 'new';
  if (nearReward) return 'almost';
  if (days > 45) return 'dormant';
  if (visits >= 10) return 'vip';
  if (days <= 14) return 'loyal';
  return 'active';
}

// Aggregate a per-tenant customer list from cards/events (CRM view).
async function buildCustomers(tenantId: string) {
  const cards = await prisma.stampCard.findMany({
    where: { campaign: { tenantId } },
    include: { customer: true, campaign: { select: { stampsRequired: true } } },
  });
  const byCustomer = new Map<string, any>();
  for (const c of cards) {
    const cur = byCustomer.get(c.customerId) ?? {
      id: c.customerId, name: c.customer.name, phone: c.customer.phone, email: c.customer.email,
      consent: !!c.customer.consentAt, visits: 0, lastVisit: null as Date | null, nearReward: false, cards: 0,
    };
    cur.visits += c.stamps + c.cyclesDone * c.campaign.stampsRequired;
    cur.cards += 1;
    if (c.stamps >= c.campaign.stampsRequired - 1 && c.stamps > 0) cur.nearReward = true;
    if (c.lastStampAt && (!cur.lastVisit || c.lastStampAt > cur.lastVisit)) cur.lastVisit = c.lastStampAt;
    byCustomer.set(c.customerId, cur);
  }
  return Array.from(byCustomer.values()).map((c) => ({ ...c, tag: tagFor(c.lastVisit, c.visits, c.nearReward) }));
}

crmRouter.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const list = await buildCustomers(tid(req));
    const segment = req.query.segment as string | undefined;
    const filtered = segment ? list.filter((c) => c.tag === segment) : list;
    ok(res, filtered.sort((a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0)));
  }),
);

crmRouter.get(
  '/customers.csv',
  asyncHandler(async (req, res) => {
    const list = await buildCustomers(tid(req));
    const header = 'name,phone,email,visits,cards,tag,lastVisit,consent\n';
    const rows = list
      .map((c) => [c.name ?? '', c.phone, c.email ?? '', c.visits, c.cards, c.tag, c.lastVisit?.toISOString() ?? '', c.consent].join(','))
      .join('\n');
    res.type('text/csv').attachment('customers.csv').send(header + rows);
  }),
);

// Segment counts for CRM dashboard tiles.
crmRouter.get(
  '/segments',
  asyncHandler(async (req, res) => {
    const list = await buildCustomers(tid(req));
    const counts: Record<string, number> = {};
    for (const c of list) counts[c.tag] = (counts[c.tag] ?? 0) + 1;
    ok(res, { total: list.length, counts });
  }),
);
