import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { badRequest } from './errors.js';

// Wrap async route handlers so thrown errors reach the error middleware.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validate a request part against a Zod schema, returning typed data.
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest('Validation failed', result.error.flatten());
  }
  return result.data;
}

export const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ ok: true, data });
