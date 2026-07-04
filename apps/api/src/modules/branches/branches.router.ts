import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { notFound } from '../../lib/errors.js';
import { audit } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const branchesRouter = Router();
branchesRouter.use(requireRole('owner', 'branch_manager', 'staff'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

branchesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const branches = await prisma.branch.findMany({
      where: { tenantId: tid(req) },
      include: { _count: { select: { stampEvents: true, qrCodes: true, users: true } } },
      orderBy: { createdAt: 'asc' },
    });
    ok(res, branches);
  }),
);

const branchSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  geofenceM: z.number().int().min(50).max(5000).optional(),
});

branchesRouter.post(
  '/',
  requireRole('owner'),
  asyncHandler(async (req, res) => {
    const body = validate(branchSchema, req.body);
    const b = await prisma.branch.create({ data: { tenantId: tid(req), ...body } });
    // Every branch gets its one evergreen store QR the moment it exists.
    await prisma.qRCode.create({ data: { tenantId: tid(req), branchId: b.id, label: `${b.name} — Store QR`, kind: 'store' } });
    await audit({ tenantId: tid(req), action: 'branch.create', target: b.id });
    ok(res, b, 201);
  }),
);

branchesRouter.patch(
  '/:id',
  requireRole('owner', 'branch_manager'),
  asyncHandler(async (req, res) => {
    const existing = await prisma.branch.findFirst({ where: { id: req.params.id, tenantId: tid(req) } });
    if (!existing) throw notFound('Branch not found');
    const body = validate(branchSchema.partial(), req.body);
    const b = await prisma.branch.update({ where: { id: existing.id }, data: body });
    ok(res, b);
  }),
);

// Branch leaderboard: stamp volume per branch (branch performance index input).
branchesRouter.get(
  '/leaderboard',
  asyncHandler(async (req, res) => {
    const branches = await prisma.branch.findMany({ where: { tenantId: tid(req) } });
    const since = new Date(Date.now() - 30 * 864e5);
    const rows = await Promise.all(
      branches.map(async (b) => {
        const [stamps, rewards] = await Promise.all([
          prisma.stampEvent.count({ where: { branchId: b.id, status: 'granted', createdAt: { gte: since } } }),
          prisma.rewardRedemption.count({ where: { card: { stampEvents: { some: { branchId: b.id } } }, status: 'claimed', createdAt: { gte: since } } }),
        ]);
        return { branchId: b.id, name: b.name, stamps, rewards };
      }),
    );
    ok(res, rows.sort((a, b) => b.stamps - a.stamps));
  }),
);
