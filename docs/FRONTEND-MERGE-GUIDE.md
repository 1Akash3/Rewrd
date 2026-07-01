# Frontend Merge Guide

This project is structured so that **another frontend can be merged in without rewriting
the backend or the data layer**. Whether you bring a Figma-exported UI, a different design
system, a second Next.js app, or a totally separate SPA, the integration surface is the same:
the **typed API client** and the **design tokens**.

## The two contracts that make merging safe

### 1. The API client (`apps/web/src/lib/`)

Every network call in the app goes through one module. A merged frontend should do the same
instead of calling `fetch` directly.

| File | Purpose |
|---|---|
| `lib/api.ts` | `request()` wrapper (auth token + `{ok,data}` envelope), plus `merchantApi` / `customerApi` typed helpers |
| `lib/types.ts` | Shared domain types that mirror API responses |
| `lib/format.ts` | INR currency, dates, initials, relative time |
| `lib/device.ts` | Device fingerprint + geolocation (for fraud/geo campaigns) |
| `lib/useMerchant.ts` / `lib/useCustomer.ts` | Session hooks + auth guards |

**These files are UI-framework-agnostic in spirit.** `api.ts`, `types.ts`, `format.ts`, and
`device.ts` are plain TypeScript with no React imports — copy them into any frontend as-is.
The two `use*.ts` hooks are the only React-specific pieces, and they're ~15 lines each.

```ts
// A merged frontend only needs this to talk to the backend:
import { merchantApi, customerApi, tokens } from '@/lib/api';

const cards = await customerApi.cards();          // typed
await customerApi.earn({ token, campaignId });     // typed
```

Auth is just a bearer token in `localStorage` under two keys
(`los_merchant_token`, `los_customer_token`), managed by `tokens.get/set/clear`. Any frontend
that sets those keys is authenticated.

### 2. The design tokens (`apps/web/src/app/globals.css` + `tailwind.config.ts`)

All colors, radii, shadows, and fonts are **CSS variables**. Components never hardcode a hex.

```css
:root {
  --brand: 79 70 229;      /* override to re-theme everything */
  --ink: 17 24 39;
  --surface: 255 255 255;
  --radius-lg: 16px;
  /* … */
}
```

To re-skin the entire app (including white-label per tenant), override these variables — no
component edits required. Tailwind maps them to utility classes (`bg-brand`, `text-ink`,
`rounded-lg`, …) via `tailwind.config.ts`.

## Three ways to merge

### Option A — Drop-in replacement of the UI, keep the plumbing (recommended)
Best when you have a new design/UI you like better.

1. Keep `apps/web/src/lib/**` and `apps/web/next.config.mjs` (the `/api` proxy).
2. Replace the route files under `apps/web/src/app/**` with your pages.
3. Point your components at `merchantApi` / `customerApi`.
4. Reuse or replace `components/ui.tsx` — if you replace it, keep the same exported names
   (`Button`, `Card`, `StampProgress`, …) so pages don't churn, **or** do a find-and-replace.

### Option B — Add your frontend as a second app in the monorepo
Best when the new frontend is a separate project (e.g. a Vite SPA or a different Next app).

1. Create `apps/web2/` and add it to the `workspaces` glob (already `apps/*`).
2. Copy `apps/web/src/lib/api.ts` + `types.ts` (or publish them as a `packages/sdk`).
3. Configure your app to proxy `/api` to `http://localhost:4000` (see `next.config.mjs`).
4. Both frontends now share one backend and one auth scheme.

For maximum reuse, promote `lib/api.ts` + `lib/types.ts` into `packages/sdk` and import
`@loyalty/sdk` from every frontend. The workspaces config already supports `packages/*`.

### Option C — Merge component-by-component
Best when you want to blend two UIs.

Because tokens are shared, components from either side render consistently. Import primitives
from `components/ui.tsx` and screens from either source; they'll all read the same CSS vars.

## Guardrails / conventions to preserve

- **Never call `fetch('/api/...')` directly** in a component — go through `api.ts`. This keeps
  the auth-token attachment and the `{ok,data}` unwrapping in one place.
- **Never hardcode colors** — use token classes so white-label theming keeps working.
- **Keep the two token keys** (`los_merchant_token`, `los_customer_token`) if you want the
  existing session hooks and backend to keep working unchanged.
- **Route groups** (`(marketing)`, `(auth)`, `(merchant)`, `(app)`, `(admin)`) isolate each
  audience's layout — replace one group without touching the others.

## Backend is already merge-ready

The API is CORS-enabled and origin-configurable (`CORS_ORIGINS` in `apps/api/.env`), so a
frontend served from a different origin works too. Every response uses the same envelope
(`{ ok: true, data }` / `{ ok: false, error: { code, message, details } }`), so error handling
is uniform across any client.
