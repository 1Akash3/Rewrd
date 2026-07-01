# Subscription & Pricing Framework

**Model:** annual B2B subscription per business, tiered by number of locations. 14-day free
trial with **no payment collection**. Prices are stored in paise (INR minor units) and shown
GST-exclusive; an 18% GST line is added on invoices. Seeded in `apps/api/prisma/seed.ts`.

| Plan | Yearly (₹) | Locations | Campaigns | Highlights |
|---|---|---|---|---|
| **Basic** | 4,999 | 1 | 3 | Core loyalty, basic analytics |
| **Growth** | 9,999 | 5 | 15 | Advanced analytics, WhatsApp |
| **Pro** | 19,999 | 20 | 100 | White-label, API access |
| **Enterprise** | 49,999 (custom) | Unlimited | 1000 | SSO, custom quotation |

## Billing lifecycle
1. **Signup → Trial** (`tenant.status = trial`, `subscription.status = trialing`, `trialEndsAt`).
2. **Subscribe** (`POST /billing/subscribe`): simulates payment, sets plan + `renewsAt = +365d`,
   flips tenant to `active`, and issues a **GST-compliant invoice** (`INV-YYYY-00001`, amount +
   18% GST, line items).
3. **Renewal / grace / retries**: annual auto-renew; failed payment → `past_due` with grace
   period; cancellation → effective at term end (`POST /billing/cancel`).

## Discounts & referrals
- Coupon codes (demo: `WELCOME20` = 20% off) applied at subscribe time.
- Referral/partner codes and franchise billing groups (Phase 2).

## Add-ons (à la carte)
Additional branches · WhatsApp messaging credits · review-campaign tools · advanced analytics ·
white-label / custom domain · API access · **AI digital-menu** tools · enterprise custom quote.

## Enterprise
Custom quotation flow, unlimited locations, SSO, white-label instances, account-manager
dashboard, data-warehouse export, multi-brand master accounts.

## GST invoicing (India)
Invoices capture amount, GST amount (18%), sequential number, status, issued/paid dates, and
JSON line items — retrievable via `GET /billing/invoices` and shown on the Billing page.
