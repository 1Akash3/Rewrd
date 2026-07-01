import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type Principal } from '../lib/auth.js';
import { forbidden, unauthorized } from '../lib/errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      principal?: Principal;
    }
  }
}

function readToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return null;
}

// Attaches req.principal if a valid token is present; does not reject.
export function attachPrincipal(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    try {
      req.principal = verifyToken(token);
    } catch {
      /* ignore invalid token — treated as anonymous */
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.principal) throw unauthorized();
  next();
}

export function requireCustomer(req: Request, _res: Response, next: NextFunction) {
  if (req.principal?.kind !== 'customer') throw unauthorized('Customer login required');
  next();
}

// Restrict to merchant/platform users with one of the given roles.
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const p = req.principal;
    if (p?.kind !== 'user') throw unauthorized('Merchant login required');
    if (roles.length && !roles.includes(p.role)) throw forbidden();
    next();
  };
}
