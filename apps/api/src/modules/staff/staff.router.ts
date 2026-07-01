import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { badRequest, notFound } from '../../lib/errors.js';
import { audit } from '../../lib/events.js';
import { hashPassword } from '../../lib/auth.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireRole } from '../../middleware/auth.js';

export const staffRouter = Router();
staffRouter.use(requireRole('owner', 'branch_manager'));

const tid = (req: any): string => {
  if (req.principal?.kind !== 'user' || !req.principal.tenantId) throw notFound('No tenant');
  return req.principal.tenantId;
};

staffRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const staff = await prisma.user.findMany({
      where: { tenantId: tid(req) },
      select: { id: true, name: true, email: true, role: true, status: true, branchId: true, lastLoginAt: true, branch: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    ok(res, staff);
  }),
);

staffRouter.post(
  '/',
  requireRole('owner'),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        role: z.enum(['branch_manager', 'staff', 'support']).default('staff'),
        branchId: z.string().optional(),
        password: z.string().min(6),
      }),
      req.body,
    );
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) throw badRequest('A user with this email already exists.');
    const u = await prisma.user.create({
      data: { tenantId: tid(req), name: body.name, email: body.email, role: body.role, branchId: body.branchId, passwordHash: await hashPassword(body.password), status: 'active' },
    });
    await audit({ tenantId: tid(req), action: 'staff.invite', target: u.id, meta: { role: body.role } });
    ok(res, { id: u.id, name: u.name, email: u.email, role: u.role }, 201);
  }),
);

staffRouter.patch(
  '/:id',
  requireRole('owner'),
  asyncHandler(async (req, res) => {
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, tenantId: tid(req) } });
    if (!existing) throw notFound('Staff not found');
    const body = validate(
      z.object({ name: z.string().optional(), role: z.enum(['branch_manager', 'staff', 'support']).optional(), branchId: z.string().nullable().optional(), status: z.enum(['active', 'disabled']).optional() }),
      req.body,
    );
    const u = await prisma.user.update({ where: { id: existing.id }, data: body });
    ok(res, { id: u.id, name: u.name, role: u.role, status: u.status, branchId: u.branchId });
  }),
);

// Staff activity log (for the Staff page + audit).
staffRouter.get(
  '/:id/activity',
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({ where: { tenantId: tid(req), actorId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    ok(res, logs);
  }),
);
