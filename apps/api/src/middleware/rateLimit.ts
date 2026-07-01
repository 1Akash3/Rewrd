import type { NextFunction, Request, Response } from 'express';
import { tooMany } from '../lib/errors.js';

// Lightweight in-memory sliding-window limiter. In production this is backed by
// Redis (see docs/ARCHITECTURE.md); the interface is kept identical so the store
// can be swapped without touching call sites.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(opts: { windowMs: number; max: number; key?: (req: Request) => string }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = (opts.key?.(req) ?? req.ip ?? 'anon') + ':' + req.baseUrl + req.path;
    const now = Date.now();
    const b = buckets.get(id);
    if (!b || b.resetAt < now) {
      buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (b.count >= opts.max) throw tooMany();
    b.count += 1;
    next();
  };
}

// Periodic cleanup to bound memory.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}, 60_000).unref?.();
