import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from '../lib/errors.js';

// Enforces platform-side access control: if you (the operator) suspend or
// terminate a merchant from the admin console, their tenant users are locked out
// of all functional endpoints. Auth routes stay open so the merchant can still
// log in and *see* the suspension message (handled by the web app).
export function enforceTenantStatus(req: Request, _res: Response, next: NextFunction) {
  const p = req.principal;
  // Only gate merchant/staff users (not customers, not platform super-admins).
  if (!p || p.kind !== 'user' || p.role === 'superadmin' || !p.tenantId) return next();

  prisma.tenant
    .findUnique({ where: { id: p.tenantId }, select: { status: true } })
    .then((tenant) => {
      if (tenant && (tenant.status === 'suspended' || tenant.status === 'cancelled')) {
        return next(
          new AppError(
            403,
            'account_' + tenant.status,
            tenant.status === 'suspended'
              ? 'Your account is paused. Please contact Rewrd to reactivate.'
              : 'This account has been closed. Please contact Rewrd.',
          ),
        );
      }
      next();
    })
    .catch(next);
}
