# Architecture

## Current implementation (runs locally, zero-config)

```
Next.js 14 (web :3000) ──/api proxy──▶ Express API (:4000) ──▶ Prisma ──▶ SQLite
   ├ (marketing)   landing/pricing/legal          modules:
   ├ (auth)        merchant login/signup            auth · campaigns · qr · stamps(+fraud)
   ├ (merchant)    dashboard (13 pages)             rewards · customer · crm · analytics
   ├ (app)         customer PWA                     branches · staff · billing · fraud
   ├ /s/[token]    QR scan flow                     admin · growth
   └ (admin)       super-admin console
```

- **Stateless JWT auth** (two audiences). **Zod** validates all input. **Rate limiting** on
  OTP/auth/stamp. **Helmet + CORS** configured. Central **error envelope** + **audit log**.
- The stamp engine is a deterministic rule stack (`modules/stamps/fraud.ts`) that produces a
  verdict before any stamp is granted; rejects are logged and can raise `FraudAlert`s.

## Production target (cloud-native, from the brief)

```
                       ┌────────── CDN (static assets, QR images) ──────────┐
  Browser / PWA ──▶ Load Balancer ──▶ Next.js (SSR/edge)                     │
                                     └▶ API Gateway ──▶ microservices:       │
                                          • Auth service                     │
                                          • Loyalty engine (stamps/rewards)  │
                                          • Billing service                  │
                                          • Notifications service            │
                                          • Fraud detection service          │
                                          • Review/social integration        │
                                          • Analytics ingestion              │
   Data:  PostgreSQL (transactional, tenant-isolated)                        │
          Redis (OTP, rate limits, caching, queues)                          │
          ClickHouse / BigQuery (AnalyticsEvent aggregation)                 │
          Object storage (QR files, posters, media)                          │
   Async: RabbitMQ / SQS / Kafka (scan events, messaging, webhooks)          │
   Ops:   Docker + Kubernetes · logs/metrics/traces · CI/CD · feature flags  │
```

### How today's monolith maps to services
Each `apps/api/src/modules/*` folder is an isolated bounded context (own router, own service
logic). Splitting into microservices later means lifting a module behind its own process and
replacing in-process calls with queue/RPC — the module boundaries already exist.

### Scaling notes
- **High QR scan volume:** `/stamps/earn` writes one `StampEvent` and updates one `StampCard`;
  in prod, scan analytics fan out to Kafka → ClickHouse so the hot path stays a couple of writes.
- **Redis** backs the rate limiter and OTP store (interface already isolated in
  `middleware/rateLimit.ts` and the OTP flow).
- **Multi-tenant isolation** via `tenantId` scoping + optional Postgres RLS.
- **Real-time** scan/reward updates via WebSocket/SSE (Phase 2) — the events already exist.

## Environments & config
`apps/api/.env` drives ports, base URLs, CORS origins, JWT secret, DB URL, OTP TTL.
Swap `DATABASE_URL` + Prisma `provider` for Postgres; everything else is env-driven.

## Deployment
- **Frontend:** `next build` → deploy to Vercel/Netlify or a Node container behind a CDN.
- **Backend:** `npm run build -w @loyalty/api` → `node dist/index.js` in a Docker container.
- **DB migrations:** `prisma migrate deploy` (dev uses `prisma db push`).
- **CI/CD:** lint → typecheck → `npm run test -w @loyalty/api` → build → deploy.
