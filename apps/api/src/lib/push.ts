import webpush from 'web-push';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';

// Web Push (PWA notifications). VAPID keys are self-generated (free); when unset,
// push silently no-ops. Subscriptions are stored per customer in PushSubscription.
export const pushEnabled = Boolean(env.vapidPublic && env.vapidPrivate);

if (pushEnabled) {
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublic, env.vapidPrivate);
}

export async function pushToCustomer(customerId: string, payload: { title: string; body: string; url?: string }) {
  if (!pushEnabled) return;
  const subs = await prisma.pushSubscription.findMany({ where: { customerId } });
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
      } catch (err: any) {
        // Prune dead subscriptions (410 Gone / 404).
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    }),
  );
}
