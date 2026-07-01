import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type Principal =
  | { kind: 'user'; id: string; tenantId: string | null; role: string; branchId: string | null }
  | { kind: 'customer'; id: string; phone: string };

export function signToken(principal: Principal): string {
  return jwt.sign(principal, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): Principal {
  return jwt.verify(token, env.jwtSecret) as Principal;
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const comparePassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

// 6-digit OTP code helpers.
export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));
export const hashOtp = (code: string) => bcrypt.hash(code, 8);
export const compareOtp = (code: string, hash: string) => bcrypt.compare(code, hash);
