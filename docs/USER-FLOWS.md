# User Flows & Information Architecture

## Information architecture (page map)

```
Marketing        /  ·  /pricing  ·  /legal/terms  ·  /legal/privacy
Auth             /login  ·  /signup (2-step wizard)
Merchant         /dashboard
                 ├ /campaigns   ├ /customers   ├ /rewards   ├ /qr
                 ├ /branches    ├ /staff        ├ /analytics ├ /messages
                 ├ /reviews     ├ /billing      ├ /fraud     └ /settings
Customer PWA     /app (cards)  ·  /app/wallet  ·  /app/offers  ·  /app/account
Scan             /s/[token]
Admin            /admin
```

## Merchant flow
```
Landing → Start free trial → Wizard (business type → brand → account) → Trial active
   → Dashboard (live analytics)
   → Campaigns → pick template / configure rules → QR auto-generated
   → QR → download branded PNG/SVG → print poster at counter
   → (daily) Rewards → verify customer reward code → mark claimed
   → Customers → segment (VIP/loyal/dormant/…) → export CSV
   → Billing → choose plan → GST invoice
   → Fraud & Audit → review alerts
```

## Staff / cashier flow
```
Login (scoped role) → Rewards page
   → customer shows reward code on phone → "Look up" → verify → "Mark claimed"
   → (staff-approval campaigns) customer scans → "pending" → staff approves the stamp
```

## Customer flow (no app install)
```
Scan QR at counter → /s/[token]
   → (first time) enter mobile → OTP → name
   → "Collect my stamp" → Stamp added! (progress shown)
   → repeat visits → threshold reached → "🎉 Reward unlocked!"
   → Reward wallet → show code to staff → redeemed
   → (optional) leave a Google review / follow on Instagram for bonus
   → Account → manage consent, export or delete data
```

## Key decision points & fallbacks
- **GPS fails** on a geo-fenced campaign → clear message to enable location; branch can be
  selected manually (shared-QR branch detection).
- **Weak network** → the scan page degrades gracefully; the earn call retries on submit.
- **Fraud block** → friendly, specific message; the customer keeps their existing progress.
- **Reward expired/claimed** → explicit staff-facing messaging; audit trail for disputes.
