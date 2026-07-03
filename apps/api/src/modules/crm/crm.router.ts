import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { notFound, badRequest } from '../../lib/errors.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';
import { sendEmail } from '../../lib/mailer.js';
import { env } from '../../config/env.js';

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
    include: { customer: true, campaign: { select: { name: true, stampsRequired: true } } },
  });
  const byCustomer = new Map<string, any>();
  for (const c of cards) {
    const cur = byCustomer.get(c.customerId) ?? {
      id: c.customerId, name: c.customer.name, phone: c.customer.phone, email: c.customer.email,
      consent: !!c.customer.consentAt, visits: 0, lastVisit: null as Date | null, nearReward: false, cards: 0,
      progress: [] as { campaignName: string; stamps: number; required: number }[],
    };
    cur.visits += c.stamps + c.cyclesDone * c.campaign.stampsRequired;
    cur.cards += 1;
    if (c.stamps >= c.campaign.stampsRequired - 1 && c.stamps > 0) cur.nearReward = true;
    if (c.lastStampAt && (!cur.lastVisit || c.lastStampAt > cur.lastVisit)) cur.lastVisit = c.lastStampAt;
    cur.progress.push({
      campaignName: c.campaign.name,
      stamps: c.stamps,
      required: c.campaign.stampsRequired,
    });
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

crmRouter.post(
  '/customers/:id/remind',
  asyncHandler(async (req, res) => {
    const tenantId = tid(req);
    const customerId = req.params.id;

    // Find the customer and their card for any campaign in this tenant
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        cards: {
          where: { campaign: { tenantId } },
          include: { campaign: true },
        },
      },
    });

    if (!customer) throw notFound('Customer not found');
    if (!customer.email) throw badRequest('Customer has no email address.');

    // Limit employee to 4 reminder emails per customer per month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const sentThisMonth = await prisma.notificationLog.count({
      where: {
        tenantId,
        customerId,
        channel: 'email_reminder',
        createdAt: { gte: startOfMonth },
      },
    });

    if (sentThisMonth >= 4) {
      throw badRequest('You can only send up to 4 reminder emails per customer per month.');
    }
    
    // Find active stamp card
    const card = customer.cards.find((c) => c.status === 'active');
    if (!card) throw badRequest('Customer has no active stamp card at this store.');

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw notFound('Tenant not found');

    const brandColor = tenant.brandColor ?? '#4f46e5';
    const remaining = card.campaign.stampsRequired - card.stamps;

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F9FAFB; padding: 32px 16px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 3px solid #111827; border-radius: 24px; box-shadow: 6px 6px 0px 0px #111827; overflow: hidden;">
          <!-- Header Banner -->
          <div style="background-color: ${brandColor}; padding: 24px; text-align: center; border-bottom: 3px solid #111827;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${tenant.name}</h1>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 24px; color: #111827;">
            <h2 style="margin-top: 0; font-size: 20px; font-weight: 800;">Hey ${customer.name || 'there'}!</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #4B5563;">
               We wanted to remind you that you have active stamps at <strong>${tenant.name}</strong>. Don't leave your rewards behind!
            </p>
            
            <!-- Progress Card -->
            <div style="margin: 24px 0; background-color: #F3F4F6; border: 2px solid #111827; border-radius: 16px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6B7280; tracking: 0.05em;">Your Stamp Progress</p>
              <div style="font-size: 36px; font-weight: 900; color: ${brandColor}; margin-bottom: 8px;">
                ${card.stamps} / ${card.campaign.stampsRequired}
              </div>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">
                Only <strong>${remaining}</strong> more stamp${remaining > 1 ? 's' : ''} to get:
              </p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: ${brandColor};">${card.campaign.rewardTitle}</p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #4B5563;">
              Simply scan our store QR code on your next visit to collect your next stamp.
            </p>
            
            <a href="${env.webBaseUrl}/app" style="display: block; text-align: center; background-color: ${brandColor}; color: #FFFFFF; font-weight: 700; padding: 14px 20px; text-decoration: none; border-radius: 12px; border: 2px solid #111827; box-shadow: 3px 3px 0px 0px #111827; margin-top: 24px; font-size: 15px;">
              View my stamp cards
            </a>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F9FAFB; padding: 16px; text-align: center; border-top: 1.5px dashed #E5E7EB;">
            <p style="margin: 0; font-size: 11px; color: #9CA3AF;">You are receiving this because you joined the loyalty program at ${tenant.name}.</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #9CA3AF;">Powered by Rewrd</p>
          </div>
        </div>
      </div>
    `;

    const sent = await sendEmail({
      to: customer.email,
      subject: `Your stamps progress at ${tenant.name} 🎁`,
      html: emailHtml,
    });

    if (sent) {
      await prisma.notificationLog.create({
        data: {
          tenantId,
          customerId,
          channel: 'email_reminder',
          status: 'sent',
        },
      });
    }

    ok(res, { sent });
  }),
);

