import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { requireCustomer } from '../../middleware/auth.js';
import { pushEnabled, pushToCustomer } from '../../lib/push.js';

export const notificationsRouter = Router();

// Public: the frontend needs the VAPID public key to create a push subscription.
notificationsRouter.get(
  '/vapid-public-key',
  asyncHandler(async (_req, res) => ok(res, { key: env.vapidPublic || null, enabled: pushEnabled })),
);

// Customer saves a browser push subscription.
notificationsRouter.post(
  '/subscribe',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) }),
      req.body,
    );
    const customerId = (req.principal as { id: string }).id;
    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      update: { customerId, p256dh: body.keys.p256dh, auth: body.keys.auth },
      create: { customerId, endpoint: body.endpoint, p256dh: body.keys.p256dh, auth: body.keys.auth },
    });
    ok(res, { subscribed: true, id: sub.id }, 201);
  }),
);

// Customer sends themselves a test notification (verifies the wiring end-to-end).
notificationsRouter.post(
  '/test',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const customerId = (req.principal as { id: string }).id;
    await pushToCustomer(customerId, { title: 'Rewrd', body: 'Push notifications are working! 🎉', url: '/app' });
    ok(res, { sent: pushEnabled });
  }),
);
