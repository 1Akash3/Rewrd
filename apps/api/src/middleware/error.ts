import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ ok: false, error: { code: 'not_found', message: 'Route not found' } });
}

// Central error formatter — all thrown errors funnel here.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res
      .status(err.status)
      .json({ ok: false, error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  // Prisma unique-constraint violations → 409
  const anyErr = err as { code?: string; message?: string };
  if (anyErr?.code === 'P2002') {
    res.status(409).json({ ok: false, error: { code: 'conflict', message: 'Resource already exists' } });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  res.status(500).json({ ok: false, error: { code: 'internal', message: 'Internal server error' } });
}
