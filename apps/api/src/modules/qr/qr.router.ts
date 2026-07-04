import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { audit } from '../../lib/events.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { qrDataUrl, qrSvg, scanUrl } from '../../lib/qr.js';
import { requireRole } from '../../middleware/auth.js';
import type { Request } from 'express';

export const qrRouter = Router();

function tenantId(req: Request): string {
  const p = req.principal!;
  if (p.kind !== 'user' || !p.tenantId) throw notFound('No tenant context');
  return p.tenantId;
}

// ---- Merchant QR codes: exactly ONE evergreen QR per branch ----
// The QR is unbound (no campaignId), so scanning it always lists whatever
// offers are live — merchants never reprint when campaigns change. GET is
// self-healing: it provisions the QR for any branch that lacks one.
qrRouter.get(
  '/',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const tid = tenantId(req);
    const branches = await prisma.branch.findMany({
      where: { tenantId: tid, status: 'active' },
      orderBy: { createdAt: 'asc' },
    });
    const items = [];
    for (const b of branches) {
      let qr = await prisma.qRCode.findFirst({
        where: { tenantId: tid, branchId: b.id, campaignId: null, kind: 'store', status: 'active' },
        orderBy: { createdAt: 'asc' },
      });
      if (!qr) {
        qr = await prisma.qRCode.create({
          data: { tenantId: tid, branchId: b.id, label: `${b.name} — Store QR`, kind: 'store' },
        });
        await audit({ tenantId: tid, action: 'qr.provision', target: qr.id });
      }
      items.push({ ...qr, branch: b, scanUrl: scanUrl(qr.token) });
    }
    ok(res, items);
  }),
);

// PNG/SVG rendering of a QR the merchant owns.
qrRouter.get(
  '/:id/image.:ext',
  requireRole('owner', 'branch_manager', 'staff'),
  asyncHandler(async (req, res) => {
    const qr = await prisma.qRCode.findFirst({ where: { id: req.params.id, tenantId: tenantId(req) } });
    if (!qr) throw notFound('QR not found');
    if (req.params.ext === 'svg') {
      res.type('image/svg+xml').send(await qrSvg(qr.token));
    } else {
      const dataUrl = await qrDataUrl(qr.token);
      const b64 = dataUrl.split(',')[1];
      res.type('image/png').send(Buffer.from(b64, 'base64'));
    }
  }),
);

// ---- Public resolve (no auth) — what the customer app calls on scan ----
export const qrPublicRouter = Router();

// Public QR image by token (safe: encodes only the opaque scan URL). Lets the
// dashboard and posters render <img> tags without sending an auth header.
qrPublicRouter.get(
  '/qr/:token.:ext',
  asyncHandler(async (req, res) => {
    const qr = await prisma.qRCode.findUnique({ where: { token: req.params.token } });
    if (!qr) throw notFound('QR not found');
    if (req.params.ext === 'svg') {
      res.type('image/svg+xml').send(await qrSvg(qr.token));
    } else {
      const b64 = (await qrDataUrl(qr.token)).split(',')[1];
      res.type('image/png').send(Buffer.from(b64, 'base64'));
    }
  }),
);

qrPublicRouter.get(
  '/resolve/:token',
  asyncHandler(async (req, res) => {
    const qr = await prisma.qRCode.findUnique({
      where: { token: req.params.token },
      include: {
        tenant: { select: { id: true, name: true, slug: true, brandColor: true, logoUrl: true, status: true, reviewLink: true, instagram: true } },
        branch: true,
        campaign: true,
      },
    });
    if (!qr || qr.status !== 'active') throw notFound('This QR code is no longer active.');

    // Count the scan (analytics + tamper heuristics live off this).
    await prisma.qRCode.update({ where: { id: qr.id }, data: { scanCount: { increment: 1 } } });

    // If no campaign is bound directly, surface the tenant's active campaigns.
    const campaigns = qr.campaignId
      ? [qr.campaign]
      : await prisma.campaign.findMany({ where: { tenantId: qr.tenantId, status: 'active' }, orderBy: { createdAt: 'asc' } });

    ok(res, {
      qr: { id: qr.id, token: qr.token, kind: qr.kind, branchId: qr.branchId },
      tenant: qr.tenant,
      branch: qr.branch,
      campaigns,
    });
  }),
);
