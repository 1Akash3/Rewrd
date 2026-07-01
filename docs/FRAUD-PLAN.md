# Fraud Prevention Plan

Stamp systems are gameable (self-scanning, shared devices, staff collusion). The engine runs a
**deterministic rule stack before any stamp is granted** (`apps/api/src/modules/stamps/fraud.ts`).
Rejected attempts are recorded as `StampEvent{status:'rejected', reason}` and, for medium/high
severity, raise a `FraudAlert` for merchant review.

## Rule stack (implemented)
| # | Rule | Config | Behavior |
|---|---|---|---|
| 1 | **Cooldown** | `campaign.cooldownMinutes` | blocks a second stamp too soon; friendly "wait N min" message |
| 2 | **Per-customer daily limit** | `campaign.perCustomerDailyLimit` | caps stamps/day on a campaign |
| 3 | **Geo-fence** | `campaign.geoValidation` + `branch.lat/lng/geofenceM` | requires location within radius; asks to enable location if missing |
| 4 | **Velocity** | ≥5 stamps from one device in 5 min | blocks device-level bursts across the tenant |
| 5 | **Staff approval** | `campaign.requireStaffApproval` | high-value rewards need staff confirmation (pending → approve) |

## Additional controls (in the platform)
- **OTP verification** — customers are phone-verified before earning.
- **Device fingerprinting** — `DeviceProfile` tracks fingerprint ↔ customer, `riskScore`, last-seen; basis for shared-device anomaly detection.
- **Duplicate/one-time protection** — rewards are single-use tokens; double-claim returns 400.
- **Audit trail** — every merchant/staff action is in `AuditLog`; disputes are resolvable.
- **Rate limiting** — OTP request/verify and stamp earn are throttled.
- **Merchant review console** — the **Fraud & Audit** dashboard page lists alerts (severity,
  status) and the full audit log; alerts can be marked reviewing/dismissed/actioned.

## Phase 2 enhancements
- Purchase-verification code from bill/POS (bind a stamp to a real transaction).
- Shared-device anomaly scoring (many customers on one fingerprint) → auto risk score.
- Suspicious-branch alerts (branch-level velocity/geo anomalies) and merchant abuse monitoring
  (a merchant self-issuing to inflate metrics).
- ML scan-pattern detection feeding `FraudAlert` with confidence scores.
- Manager-override with reason logging on staff notes.

## Severity → action
`low` (cooldown/daily-limit): silent block, no alert (avoids noise).
`medium` (geo-missing): block + alert.
`high` (out-of-range, velocity): block + high-severity alert surfaced on the Overview page.
