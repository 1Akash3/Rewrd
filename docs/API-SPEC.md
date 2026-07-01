# API Specification

Base URL: `/api` (the web app proxies this to the backend at `http://localhost:4000`).

**Response envelope**
- Success: `{ "ok": true, "data": <payload> }`
- Error: `{ "ok": false, "error": { "code": string, "message": string, "details"?: any } }`

**Auth:** `Authorization: Bearer <jwt>`. Two audiences: merchant users and customers.
Tokens carry `{ kind: 'user'|'customer', id, tenantId?, role?, branchId? }`.

**Rate limiting:** OTP + auth + stamp endpoints are rate limited (in-memory dev; Redis in prod).

---

## Auth
| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/auth/merchant/signup` | — | `{ businessName, businessType, ownerName, email, password, phone? }` → creates tenant + owner + main branch + trial; returns `{ token, tenant, user }` |
| POST | `/auth/merchant/login` | — | `{ email, password }` → `{ token, user, tenant }` |
| POST | `/auth/customer/otp/request` | — | `{ phone }` → `{ sent, devCode? }` (dev echoes the code) |
| POST | `/auth/customer/otp/verify` | — | `{ phone, code, name? }` → `{ token, customer }` |
| GET | `/auth/me` | any | current principal (user or customer) |

## Campaigns (merchant)
| Method | Path | Roles |
|---|---|---|
| GET | `/campaigns` | owner, branch_manager, staff |
| POST | `/campaigns` | owner, branch_manager — creates campaign + auto-provisions a store QR |
| GET | `/campaigns/:id` | any staff |
| PATCH | `/campaigns/:id` | owner, branch_manager |
| DELETE | `/campaigns/:id` | owner (soft-ends) |

Campaign body: `{ name, type, stampsRequired, rewardTitle, rewardDetail?, rewardValidityD,
perCustomerDailyLimit, cooldownMinutes, requireStaffApproval, geoValidation, branchScope,
terms?, status, startAt?, endAt? }`.

## QR
| Method | Path | Auth |
|---|---|---|
| GET | `/qr` | merchant staff — list inventory (+ `scanUrl`) |
| POST | `/qr` | owner, branch_manager — `{ label, kind, branchId?, campaignId? }` |
| GET | `/qr/:id/image.:ext` | merchant staff — `png`/`svg` |
| GET | `/public/qr/:token.:ext` | — public QR image (safe; encodes only the scan URL) |
| GET | `/public/resolve/:token` | — resolve a scanned QR → `{ qr, tenant, branch, campaigns }` |

## Stamps (the engine)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/stamps/earn` | customer | `{ token, campaignId, deviceFp?, lat?, lng? }` → runs fraud checks; returns `{ status:'granted', card, rewardUnlocked }` or `pending`, or 400 with fraud `reason` |
| POST | `/stamps/:eventId/approve` | staff | approve a pending (staff-approval) stamp |

## Rewards
| Method | Path | Auth |
|---|---|---|
| GET | `/rewards` | merchant staff — `?status=unlocked\|claimed\|expired` |
| GET | `/rewards/lookup/:token` | merchant staff — verify a customer's reward code |
| POST | `/rewards/:token/claim` | merchant staff — one-time claim (+ expiry check) |

## Customer self-service (`/me`, customer auth)
| Method | Path | Notes |
|---|---|---|
| GET | `/me/cards` | all loyalty cards + progress + brand |
| GET | `/me/rewards` | reward wallet |
| GET | `/me/history` | granted stamp history |
| PATCH | `/me/profile` | name/email/birthday/consent/locale |
| GET | `/me/me/export` | GDPR-style data export |
| DELETE | `/me/me` | GDPR-style deletion (PII stripped) |

## CRM (merchant)
| Method | Path |
|---|---|
| GET | `/crm/customers?segment=` — aggregated per-tenant customer list w/ lifecycle tag |
| GET | `/crm/customers.csv` — CSV export |
| GET | `/crm/segments` — segment counts |

## Branches / Staff
| Method | Path |
|---|---|
| GET/POST | `/branches` , PATCH `/branches/:id` , GET `/branches/leaderboard` |
| GET/POST | `/staff` , PATCH `/staff/:id` , GET `/staff/:id/activity` |

## Analytics (merchant)
`GET /analytics/overview` · `/analytics/trend` · `/analytics/breakdown` · `/analytics/campaigns`

## Fraud (merchant)
`GET /fraud/alerts` · `PATCH /fraud/alerts/:id` · `GET /fraud/audit`

## Billing
`GET /billing/plans` (public) · `GET /billing/subscription` · `POST /billing/subscribe`
`{ planCode, couponCode? }` · `GET /billing/invoices` · `POST /billing/cancel`

## Growth
Customer: `POST /growth/review` · `/growth/social` · `/growth/referral`.
Merchant: `GET /growth/merchant/summary` · `GET/POST /growth/merchant/menu` · `POST /growth/merchant/menu/ai`.

## Admin (super-admin)
`GET /admin/overview` · `/admin/tenants` · `PATCH /admin/tenants/:id` · `GET /admin/fraud`

## Webhooks (Phase 2)
Outbound webhooks for `stamp.granted`, `reward.unlocked`, `reward.claimed`, `fraud.alert`,
`subscription.updated` — signed with an HMAC secret per tenant. (Design in ARCHITECTURE.md.)
