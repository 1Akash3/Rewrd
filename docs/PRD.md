# Product Requirements Document — Rewrd

## 1. Vision
Replace paper stamp cards with a **QR-first, no-app digital loyalty experience** that helps
local Indian businesses turn one-time visitors into regulars, capture customer contact data,
grow reviews & social follows, and see real-time analytics. Sold as **B2B SaaS** (annual
subscription per business); free for end customers.

## 2. Target users & roles

| Role | Needs | In this build |
|---|---|---|
| **Super Admin** | Platform control, plans, disputes, fraud review, cross-tenant analytics | `/admin` console, `admin` APIs |
| **Merchant Owner** | Subscribe, configure brand, build campaigns, manage staff/branches, view analytics | Full dashboard |
| **Branch Manager** | Branch analytics, reward validation, scan monitoring | Role-scoped dashboard |
| **Staff / Cashier** | Issue stamps, approve, redeem rewards | Rewards verify + stamp approval |
| **Customer** | Scan, OTP login, see cards/rewards, redeem | Customer PWA |
| **Support Agent** | Onboarding & merchant assistance | Role in RBAC (`support`) |
| **Sales / Admin Ops** | Leads, activation, trial conversion | Role in RBAC (`sales`) |

## 3. Core objective (the loop)
1. Merchant signs up → creates one or more loyalty campaigns.
2. System generates QR codes (store / counter / table / branch).
3. Customer scans QR after a purchase.
4. Customer earns a stamp **instantly on mobile, no app install**.
5. On reaching the stamp threshold, a reward unlocks.
6. Merchant/staff validate and mark the reward claimed.
7. Platform tracks repeat visits, active customers, redemption rates, scans, branch performance.

## 4. Platform modules
1. **Acquisition & onboarding** — landing page, OTP/passwordless signup, onboarding wizard (business type → brand → branches → reward → QR → staff → trial), KYC option, lead capture, trial→paid.
2. **Subscription & billing** — Basic/Growth/Pro/Enterprise, annual billing, trial without payment, coupons/referrals, GST invoicing, renewals/grace/retries, add-ons (branches, WhatsApp credits, review tools, advanced analytics, white-label, API, AI menu), enterprise quotes.
3. **Merchant dashboard** — scans (day/week/month), active/repeat customers, completions, redemption rate, avg visits, branch comparison, top campaigns, new vs returning, drop-off, cohort retention, popular times, staff logs, fraud alerts.
4. **Loyalty campaign builder** — visit/purchase/spend/category/time-window/seasonal/scratch/menu-linked/referral/review/social/birthday/welcome/tiered; full rule config (threshold, validity, branch eligibility, daily limits, staff approval, geo, cooldown, fraud checks, T&Cs, dates, segmentation, creatives).
5. **QR system** — static, shared+GPS branch detection, table/counter/bill/staff, branded posters, printable templates, dynamic redirect, event logging (timestamp/branch/device/geo), tamper detection, fallback short-link, offline recovery.
6. **Customer PWA** — OTP login, loyalty cards, instant stamps, progress bars, redemption, nearby stores, favorites, history, reminders, social follow, Google reviews, digital menus, scratch cards, referrals, multilingual, share, add-to-home-screen.
7. **Reward redemption** — auto-unlock, unique token/QR/barcode, staff verification, expiry/grace, partial rules, one-time protection, audit trail, proof of history, staff notes + manager override.
8. **CRM & insights** — name/phone capture, visit frequency, avg gap, last visit, completion %, preferred branch, engagement, review/social flags, birthday/anniversary, tags (VIP/at-risk/new/loyal/inactive), segmentation, CSV export, consent.
9. **Messaging & re-engagement** — WhatsApp/SMS/email/push, "1 stamp away", comeback, expiry reminders, review requests, festival greetings, branch announcements, smart send-time, templates, opt-out.
10. **Reviews & social growth** — review prompt after milestone, Google redirect, social buttons, reward-after-review logic, click/conversion tracking, growth dashboard.
11. **Multi-location & franchise** — central account, shared campaigns, branch overrides, GPS detection, branch analytics, staff assignment, region managers, franchise billing groups, leaderboard, QR inventory, centralized customer view.
12. **Fraud & abuse control** — OTP, cooldown, geo-fence, device fingerprint, duplicate detection, anti-spam, staff confirmation for high-value, purchase verification code, velocity checks, shared-device anomaly, suspicious-branch alerts, merchant abuse monitoring, dispute console.

## 5. Advanced (Phase 2+)
- **Gamification:** streaks, surprise bonus stamps, scratch cards, lucky spin, seasonal badges, Bronze/Silver/Gold tiers, achievements, hidden rewards, location challenges.
- **AI:** AI digital menu, campaign recommendations, churn prediction, reward-threshold suggestions, auto-segmentation, best-time-to-message, suspicious-scan detection, poster/social copy generation, dashboard insight summaries.
- **Commerce:** digital ordering, POS APIs, coupons, gift cards, wallet credits, subscription memberships, event/booking-linked rewards.
- **Enterprise:** white-label instances, RBAC, SLA monitoring, audit logs, SSO, API/webhooks, account-manager dashboard, data-warehouse export, brand templates, multi-brand master accounts.

## 6. Key metrics / KPIs
Trial→paid conversion, repeat-visit uplift, card completion rate, scan→redemption rate, cost per retained customer, monthly active merchants, monthly active customers, avg scans/customer, average reward liability, churn by tier, branch performance index, review conversion, social-follow conversion, campaign ROI estimate. (See [ANALYTICS-TAXONOMY.md](ANALYTICS-TAXONOMY.md).)

## 7. UX requirements
One-click onboarding, template-based campaigns, visual reward progress, low-friction QR scan,
clear branch selection if GPS fails, fast plain-language dashboards, minimal training, strong
mobile usability for both merchant and customer.

## 8. Compliance & trust
Consent management, terms & privacy pages, GDPR-style deletion/export + Indian data-handling
best practices, OTP security, rate limiting, admin audit logs, secure billing records, abuse
reporting, merchant ownership verification (KYC).

## 9. MVP scope (implemented here)
- Merchant signup/login + onboarding wizard; customer OTP login.
- Campaign builder (visit/purchase types) with fraud-relevant rules.
- QR generation + dynamic resolve + branded PNG/SVG download.
- Stamp engine with fraud checks (cooldown, daily limit, geo, velocity).
- Reward auto-unlock, staff verification & one-time claim.
- Analytics overview + trend + breakdown + campaign/branch performance.
- CRM with segmentation + CSV export + consent.
- Billing plans + subscribe + GST invoices.
- Fraud alerts + audit log.
- Reviews/social + referral tracking + AI-menu stub.
- Customer PWA: cards, wallet, scan, offers, account (export/delete).
- Super-admin console.

## 10. Phase 2 growth (documented, scaffolded)
Scratch cards & lucky spin UIs, WhatsApp/SMS delivery integration, AI recommendation engine,
POS/webhooks, white-label domains, SSO, franchise billing groups, ClickHouse analytics
pipeline, real-time scan sockets. Data model & APIs already accommodate these.
