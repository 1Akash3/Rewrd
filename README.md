# Rewrd — QR-first Digital Loyalty Platform

A production-shaped, multi-tenant **B2B SaaS** loyalty platform for local businesses
(cafés, salons, gyms, bakeries, restaurants, boutiques, car washes). Merchants pay a
yearly subscription; end customers use it **free** by scanning a QR to collect digital
stamps and redeem rewards — **no app install**.

This repository contains a **running full-stack implementation** of the core product plus
the full product/architecture documentation set.

```
┌─────────────────────────────────────────────────────────────────┐
│  Merchant signs up ─▶ builds a campaign ─▶ QR auto-generated     │
│  Customer scans QR ─▶ OTP login ─▶ earns a stamp instantly       │
│  Threshold reached ─▶ reward unlocks ─▶ staff verifies & claims  │
│  Everything feeds ─▶ analytics · CRM · fraud · reviews · billing │
└─────────────────────────────────────────────────────────────────┘
```

## What's in the box

| Area | Status |
|---|---|
| Multi-tenant backend (Express + TypeScript + Prisma) | ✅ Running |
| Core loyalty loop: campaigns → QR → stamps → rewards | ✅ End-to-end, tested |
| Fraud engine (cooldown, geo-fence, daily limit, velocity) | ✅ Running |
| Merchant dashboard (13 pages) | ✅ Live data |
| Customer PWA (cards, wallet, scan, offers, account) | ✅ Live data |
| Marketing site + pricing + auth | ✅ |
| Super-admin console | ✅ |
| Billing (plans, subscribe, GST invoices) | ✅ |
| CRM + CSV export + segmentation | ✅ |
| Analytics (KPIs, trends, cohorts, branch index) | ✅ |
| Docs: PRD, API, schema, design system, deployment, testing… | ✅ `docs/` |

## Monorepo layout

```
loyalty-os/
├── apps/
│   ├── api/          # Express + TypeScript + Prisma backend (the loyalty engine)
│   └── web/          # Next.js 14 App Router frontend (dashboard + PWA + marketing)
├── docs/             # PRD, architecture, API spec, design system, and more
└── package.json      # npm workspaces
```

The `web` app is deliberately organized so a **second/alternate frontend can be merged in
cleanly** — see [`docs/FRONTEND-MERGE-GUIDE.md`](docs/FRONTEND-MERGE-GUIDE.md).

## Quick start

Prerequisites: **Node 20+**.

```bash
# 1. Install everything
npm install
npm install --workspaces

# 2. Set up the API database (SQLite, zero-config) + seed demo data
cp apps/api/.env.example apps/api/.env
npm run db:setup            # prisma db push + seed

# 3. Run both apps (api on :4000, web on :3000)
npm run dev
```

Open **http://localhost:3000**.

### Demo logins (created by the seed)

| Role | Credentials |
|---|---|
| Merchant owner | `owner@brewbean.dev` / `owner1234` |
| Staff/cashier | `staff@brewbean.dev` / `staff1234` |
| Super admin | `admin@rewrd.dev` / `admin1234` → `/admin` |
| Customer | phone `+919999900001` — OTP is echoed on screen in dev |

### Try the flow
1. Log in as the merchant → **Dashboard** shows live analytics.
2. Go to **QR Codes**, open a QR, click **Test scan** (or scan the PNG).
3. On the scan page, sign in with any phone number (OTP is shown in dev) and **Collect my stamp**.
4. Repeat to the threshold → a reward unlocks in the customer **Reward wallet**.
5. Back in the dashboard **Rewards** page, paste the reward token and **Mark claimed**.

## Testing

```bash
npm run test -w @loyalty/api     # end-to-end smoke test of the full core loop (15 assertions)
```

## Tech stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind (token-driven design system), PWA manifest.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Zod validation, JWT auth, bcrypt, `qrcode`.
- **Database:** SQLite for local dev (swap `provider` + `DATABASE_URL` to PostgreSQL for prod).
- **Design:** mobile-first, accessible, CSS-variable theming for white-label / per-tenant branding.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the cloud-native production target
(Postgres, Redis, ClickHouse, object storage, queues, Docker/K8s).

## Documentation

All deliverables live in [`docs/`](docs/):

- [PRD.md](docs/PRD.md) — product requirements, roles, modules, KPIs, MVP & Phase 2
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system + deployment architecture
- [DATA-MODEL.md](docs/DATA-MODEL.md) — entities & schema (canonical schema in `apps/api/prisma/schema.prisma`)
- [API-SPEC.md](docs/API-SPEC.md) — REST API reference
- [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — tokens, components, UX principles
- [FRONTEND-MERGE-GUIDE.md](docs/FRONTEND-MERGE-GUIDE.md) — how to merge another frontend
- [ANALYTICS-TAXONOMY.md](docs/ANALYTICS-TAXONOMY.md) — event names & KPIs
- [FRAUD-PLAN.md](docs/FRAUD-PLAN.md) — abuse prevention strategy
- [PRICING.md](docs/PRICING.md) — subscription & billing framework
- [TESTING.md](docs/TESTING.md) — test plan
- [UI-COPY.md](docs/UI-COPY.md) — onboarding & reward flow copy
- [USER-FLOWS.md](docs/USER-FLOWS.md) — merchant / staff / customer journeys
