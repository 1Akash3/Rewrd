# Testing Plan

## Automated (implemented)
**End-to-end smoke test** — `npm run test -w @loyalty/api`
(`apps/api/src/test/smoke.test.ts`). Boots the real Express app and exercises the full core
loop over HTTP (15 assertions):

1. Merchant signup returns a token
2. Campaign creation
3. Auto-provisioned QR exists for the campaign
4. Public QR resolve works
5. Customer OTP request (dev echo)
6. Customer OTP verify → token
7–9. Earn stamps to threshold (3 stamps)
10. Reward unlock at threshold
11. Reward appears in the customer wallet
12. Staff claims the reward
13. Double-claim is blocked (one-time protection)
14. Analytics overview counts the claim
15. Fraud: cooldown blocks a rapid second stamp

**Type safety:** `tsc --noEmit` on the API; `next build` type-checks the whole frontend
(27 routes compile clean).

## Manual / exploratory (verified during build)
- Landing, pricing, login/signup rendering.
- Merchant dashboard with live seeded analytics (KPIs, donut, bars, top campaigns).
- Customer PWA: branded loyalty cards, stamp progress, wallet.
- Scan flow: resolve → collect → "Stamp added!" celebration; reward-unlock path.
- Full loop through the Next.js `/api` proxy (browser path), not just direct API.

## Recommended additions (Phase 2)
| Layer | Tooling | Coverage |
|---|---|---|
| Unit | Vitest | fraud rule stack, progress/unlock math, formatters |
| Integration | Supertest | each module's endpoints + RBAC + tenant isolation |
| E2E | Playwright | signup→campaign→scan→reward→claim across real browsers; PWA install |
| Load | k6 | `/stamps/earn` at high QR-scan concurrency |
| Security | OWASP ZAP / npm audit | authz, rate limits, injection, dependency CVEs |
| Contract | Zod schemas as the shared source of truth for request/response shapes |

## CI pipeline (suggested)
`install → lint → typecheck (api + web) → api smoke test → next build → deploy`.
Fail fast on typecheck and the smoke test before building.
