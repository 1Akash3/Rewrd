import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import {
  comparePassword,
  compareOtp,
  genOtp,
  hashOtp,
  hashPassword,
  signToken,
} from '../../lib/auth.js';
import { badRequest, notFound, unauthorized } from '../../lib/errors.js';
import { audit, track } from '../../lib/events.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/auth.js';
import { sendOtp } from '../../lib/otp-provider.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(env.googleClientId);

export const authRouter = Router();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'brand';

/* ----------------------------- Merchant signup ---------------------------- */
const signupSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.string().default('cafe'),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(6).optional(),
});

authRouter.post(
  '/merchant/signup',
  rateLimit({ windowMs: 60_000, max: 10 }),
  asyncHandler(async (req, res) => {
    const body = validate(signupSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw badRequest('An account with this email already exists.');

    // Unique slug
    let slug = slugify(body.businessName);
    let n = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) slug = `${slugify(body.businessName)}-${n++}`;

    const trialPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'basic' } });

    const tenant = await prisma.tenant.create({
      data: {
        name: body.businessName,
        slug,
        businessType: body.businessType,
        status: 'trial',
        users: {
          create: {
            role: 'owner',
            name: body.ownerName,
            email: body.email,
            phone: body.phone,
            passwordHash: await hashPassword(body.password),
          },
        },
        branches: { create: { name: 'Main Branch' } },
        ...(trialPlan
          ? {
              subscription: {
                create: {
                  planId: trialPlan.id,
                  status: 'trialing',
                  trialEndsAt: new Date(Date.now() + env.trialDays * 864e5),
                },
              },
            }
          : {}),
      },
      include: { users: true },
    });

    const user = tenant.users[0];
    await audit({ tenantId: tenant.id, actorId: user.id, action: 'merchant.signup', target: tenant.id });
    await track('merchant_signup', { tenantId: tenant.id, props: { businessType: body.businessType } });

    const token = signToken({ kind: 'user', id: user.id, tenantId: tenant.id, role: 'owner', branchId: null });
    ok(res, { token, tenant: { id: tenant.id, name: tenant.name, slug }, user: { id: user.id, name: user.name, role: 'owner' } }, 201);
  }),
);

/* ------------------------------ Merchant login ---------------------------- */
authRouter.post(
  '/merchant/login',
  rateLimit({ windowMs: 60_000, max: 20 }),
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ email: z.string().email(), password: z.string() }), req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email }, include: { tenant: true } });
    if (!user || !user.passwordHash) throw unauthorized('Invalid email or password.');
    const good = await comparePassword(body.password, user.passwordHash);
    if (!good) throw unauthorized('Invalid email or password.');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = signToken({ kind: 'user', id: user.id, tenantId: user.tenantId, role: user.role, branchId: user.branchId });
    ok(res, {
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email },
      tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug, brandColor: user.tenant.brandColor } : null,
    });
  }),
);

/* ---------------------------- Customer OTP flow --------------------------- */
authRouter.post(
  '/customer/otp/request',
  rateLimit({ windowMs: 60_000, max: 5, key: (r) => (r.body?.phone ?? r.ip) as string }),
  asyncHandler(async (req, res) => {
    const { phone } = validate(z.object({ phone: z.string().min(6) }), req.body);
    const code = genOtp();
    await prisma.otpChallenge.create({
      data: {
        phone,
        codeHash: await hashOtp(code),
        purpose: 'customer_login',
        expiresAt: new Date(Date.now() + env.otpTtlSeconds * 1000),
      },
    });
    // Dispatch via the configured provider (echo in dev, WhatsApp/MSG91/Twilio in prod).
    await sendOtp(phone, code);
    ok(res, { sent: true, ...(env.otpDevEcho ? { devCode: code } : {}) });
  }),
);

authRouter.post(
  '/customer/otp/verify',
  rateLimit({ windowMs: 60_000, max: 10, key: (r) => (r.body?.phone ?? r.ip) as string }),
  asyncHandler(async (req, res) => {
    const { phone, code, name } = validate(
      z.object({ phone: z.string().min(6), code: z.string().length(6), name: z.string().optional() }),
      req.body,
    );
    const challenge = await prisma.otpChallenge.findFirst({
      where: { phone, purpose: 'customer_login', consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) throw badRequest('Code expired or not found. Please request a new one.');
    if (challenge.attempts >= 5) throw badRequest('Too many attempts. Request a new code.');

    const good = await compareOtp(code, challenge.codeHash);
    if (!good) {
      await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      throw unauthorized('Incorrect code.');
    }
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });

    const customer = await prisma.customer.upsert({
      where: { phone },
      update: name ? { name } : {},
      create: { phone, name },
    });
    await track('customer_login', { customerId: customer.id });
    const token = signToken({ kind: 'customer', id: customer.id, phone: customer.phone });
    ok(res, { token, customer: { id: customer.id, phone: customer.phone, name: customer.name } });
  }),
);

/* --------------------- Merchant Google Sign-In (auto-login) --------------- */
// Frontend uses Google Identity Services, gets an ID token, and posts it here.
// Existing user -> logged in. New user -> a tenant + owner are auto-provisioned
// (one-click signup), so merchants never type a password.
authRouter.post(
  '/merchant/google',
  rateLimit({ windowMs: 60_000, max: 20 }),
  asyncHandler(async (req, res) => {
    if (!env.googleClientId) throw badRequest('Google Sign-In is not configured on the server.');
    const { credential } = validate(z.object({ credential: z.string().min(10) }), req.body);

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) throw unauthorized('Google account email not verified.');

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
      include: { tenant: true },
    });

    if (!user) {
      // One-click signup: provision a tenant + owner from the Google profile.
      const displayName = payload.name ?? payload.email.split('@')[0];
      let slug = slugify(displayName);
      let n = 1;
      while (await prisma.tenant.findUnique({ where: { slug } })) slug = `${slugify(displayName)}-${n++}`;
      const trialPlan = await prisma.subscriptionPlan.findUnique({ where: { code: 'basic' } });
      const tenant = await prisma.tenant.create({
        data: {
          name: `${displayName}'s Business`,
          slug,
          status: 'trial',
          users: { create: { role: 'owner', name: displayName, email: payload.email, googleId: payload.sub, avatarUrl: payload.picture } },
          branches: { create: { name: 'Main Branch' } },
          ...(trialPlan ? { subscription: { create: { planId: trialPlan.id, status: 'trialing', trialEndsAt: new Date(Date.now() + env.trialDays * 864e5) } } } : {}),
        },
        include: { users: true },
      });
      user = { ...tenant.users[0], tenant } as any;
      await audit({ tenantId: tenant.id, actorId: tenant.users[0].id, action: 'merchant.signup.google', target: tenant.id });
      await track('merchant_signup', { tenantId: tenant.id, props: { via: 'google' } });
    } else if (!user.googleId) {
      // Link Google to an existing password account.
      await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub, avatarUrl: payload.picture } });
    }

    await prisma.user.update({ where: { id: user!.id }, data: { lastLoginAt: new Date() } });
    const token = signToken({ kind: 'user', id: user!.id, tenantId: user!.tenantId, role: user!.role, branchId: user!.branchId });
    ok(res, {
      token,
      user: { id: user!.id, name: user!.name, role: user!.role, email: user!.email, avatarUrl: user!.avatarUrl },
      tenant: user!.tenant ? { id: user!.tenant.id, name: user!.tenant.name, slug: user!.tenant.slug, brandColor: user!.tenant.brandColor } : null,
    });
  }),
);

/* --------------------------------- Whoami --------------------------------- */
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const p = req.principal!;
    if (p.kind === 'customer') {
      const c = await prisma.customer.findUnique({ where: { id: p.id } });
      if (!c) throw notFound();
      return ok(res, { kind: 'customer', customer: { id: c.id, phone: c.phone, name: c.name, email: c.email } });
    }
    const u = await prisma.user.findUnique({ where: { id: p.id }, include: { tenant: true, branch: true } });
    if (!u) throw notFound();
    ok(res, {
      kind: 'user',
      user: { id: u.id, name: u.name, role: u.role, email: u.email, branchId: u.branchId },
      tenant: u.tenant ? { id: u.tenant.id, name: u.tenant.name, slug: u.tenant.slug, brandColor: u.tenant.brandColor, status: u.tenant.status } : null,
    });
  }),
);
