# Data Model

Canonical schema: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma).
SQLite for local dev; switch `provider` to `postgresql` for production. Enum-like fields are
stored as `String` (documented allowed values) and JSON payloads as `String` for portability.

## Entity map

```
Tenant 1─┬─* User (roles: superadmin|owner|branch_manager|staff|support|sales)
         ├─* Branch 1─* QRCode
         ├─* Campaign 1─* QRCode
         │             1─* StampCard *─1 Customer
         │             1─* StampEvent
         │             1─* RewardRedemption
         ├─1 Subscription *─1 SubscriptionPlan
         ├─* BillingInvoice
         ├─* FraudAlert / AuditLog / DigitalMenu / LoyaltyTier / NotificationTemplate / SupportTicket

Customer (global by phone) 1─* StampCard / RewardRedemption / DeviceProfile / Referral / ReviewAction / SocialAction
OtpChallenge · AnalyticsEvent · NotificationLog (operational tables)
```

## Key design decisions
- **Tenant = the paying business** (unit of isolation). Every merchant query is scoped by
  `tenantId` derived from the JWT — never from client input.
- **Customer is global** (keyed by phone), because one person joins many businesses. Per-tenant
  CRM is *derived* from that customer's `StampCard`s/`StampEvent`s for that tenant's campaigns.
- **StampCard** is the enrollment + running balance (`stamps`, `cyclesDone`). `@@unique([customerId, campaignId])`.
- **StampEvent** is the immutable ledger (granted/pending/rejected) with device/geo/staff/qr
  context — the source of truth for analytics and fraud.
- **RewardRedemption** is a unique-token instance with one-time claim protection + expiry.
- **AuditLog** and **AnalyticsEvent** are append-only.

## Entities (28)
Tenant, User, Branch, Customer, Campaign, QRCode, StampCard, StampEvent, RewardRedemption,
SubscriptionPlan, Subscription, BillingInvoice, OtpChallenge, DeviceProfile, FraudAlert,
AnalyticsEvent, AuditLog, Referral, ReviewAction, SocialAction, DigitalMenu, LoyaltyTier,
NotificationTemplate, NotificationLog, SupportTicket. *(CustomerIdentity, CampaignRule,
PaymentTransaction and ScratchCardCampaign from the spec are represented inline — e.g. rules
live on `Campaign`, identity on `Customer` — and can be split into dedicated tables in Phase 2
without breaking callers.)*

## Multi-tenant isolation
- Enforced in every router: the tenant id comes from `req.principal.tenantId`.
- Cross-tenant access is only possible via `superadmin` (`/admin/*`).
- Postgres deployments can add Row-Level Security policies keyed on a `tenant_id` session var
  for defense-in-depth.
