# Production Checklist & Keys

What's real today vs. what a key unlocks. Everything runs in dev with safe stubs; going live
is mostly filling env vars and swapping ~4 adapter functions.

## Status: what already works (no keys needed)
- Full loyalty loop (campaigns → QR → stamps → rewards → claim), fraud engine, analytics,
  CRM, branches/staff, dashboard, customer PWA, admin console.
- QR generation + dynamic resolve + scan flow (verified end-to-end).
- Billing flow with **simulated** payment + GST invoice generation.
- OTP with on-screen dev echo.

## 🔴 Required to launch

| Key | Unlocks | Where it plugs in |
|---|---|---|
| `JWT_SECRET` | secure auth tokens | `config/env.ts` (already used) — set a random 64-char string |
| `DATABASE_URL` + Prisma `provider=postgresql` | production database | `prisma/schema.prisma`, run `prisma migrate deploy` |
| `WEB_BASE_URL` | **QR codes point to your real domain** (critical — printed QRs encode this) | `lib/qr.ts` (already used) |
| `API_BASE_URL`, `CORS_ORIGINS` | correct API origin + browser access | `config/env.ts` (already used) |
| `OTP_PROVIDER` + `MSG91_AUTH_KEY`/`SENDER_ID` (or Twilio) | **real SMS/WhatsApp OTP** instead of on-screen echo | `modules/auth/auth.router.ts` → replace the `console.log('[otp]…')` line with a provider call; set `OTP_DEV_ECHO=false` |

## 🟠 Required for paid subscriptions

| Key | Unlocks | Plug-in point |
|---|---|---|
| `RAZORPAY_KEY_ID` / `KEY_SECRET` / `WEBHOOK_SECRET` | real card/UPI payment for the "subscribe after trial" step | `modules/billing/billing.router.ts` → replace the simulated `subscribe` with: create Razorpay order → client checkout → verify webhook signature → then run the existing invoice code. The trial→paywall→invoice logic already exists. |

**How the 30-day-free-then-subscribe model works (already wired):**
1. Signup sets `subscription.status='trialing'`, `trialEndsAt = now + TRIAL_DAYS` (30). No card.
2. During the trial everything is fully usable.
3. At/after `trialEndsAt`, a **trial gate** (add `middleware/trialGuard.ts`) flips the dashboard to
   read-only and shows "Subscribe to continue." (Data model + status fields already support this.)
4. Merchant clicks **Subscribe** → Razorpay checkout (once keys are in) → `status='active'`,
   `renewsAt = +365d`, GST invoice issued.
Set `TRIAL_DAYS` to change the free period (your copy said 3 days; product decision was 30).

## 🟡 Per-feature (optional, add when you want the feature)

| Key | Feature |
|---|---|
| `REDIS_URL` | move OTP store + rate limiter + queues to Redis (swap `middleware/rateLimit.ts` store) |
| `S3_*` / R2 | persist QR posters & campaign creatives to object storage |
| `RESEND_API_KEY` | email invoices + reminders (Messages module) |
| `VAPID_*` | PWA push ("1 stamp away", reward expiry) |
| `GOOGLE_MAPS_API_KEY` | reverse-geocode GPS → branch name for shared-QR branch detection |
| `SENTRY_DSN` | error monitoring |

## Go-live steps
1. Provision Postgres + Redis; set `DATABASE_URL`, `REDIS_URL`.
2. Set `JWT_SECRET`, `WEB_BASE_URL`, `API_BASE_URL`, `CORS_ORIGINS`, `OTP_DEV_ECHO=false`.
3. Wire OTP provider (1 function) and Razorpay (1 module).
4. `prisma migrate deploy` → seed plans → deploy API (Docker) + web (Vercel/Node+CDN).
5. Point DNS; confirm a printed QR opens `https://yourdomain/s/<token>`.
6. Smoke test the live loop; enable Sentry.
