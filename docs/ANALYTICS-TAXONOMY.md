# Analytics Event Taxonomy

Events are written to `AnalyticsEvent` via `track(name, {...})` (`apps/api/src/lib/events.ts`).
In production these fan out to ClickHouse/BigQuery for aggregation. Each event carries
`tenantId?`, `branchId?`, `campaignId?`, `customerId?`, and a JSON `props` bag.

## Event names
| Event | When | Key props |
|---|---|---|
| `merchant_signup` | merchant creates account | `businessType` |
| `trial_converted` | merchant subscribes to a paid plan | `plan` |
| `campaign_created` | campaign created | `type` |
| `customer_login` | customer verifies OTP | — |
| `stamp_granted` | a stamp is issued | branch, campaign, customer |
| `stamp_pending` | staff-approval stamp queued | — |
| `stamp_rejected` | fraud check blocked a stamp | `reason` |
| `reward_unlocked` | threshold reached | campaign, customer |
| `reward_claimed` | staff marks reward redeemed | campaign, customer |
| `review_clicked` / `review_submitted` | review growth funnel | — |
| `social_click` | social follow button clicked | `platform` |
| `customer_deletion` | GDPR delete requested | — |

## KPIs & how they're computed
| KPI | Definition | Source |
|---|---|---|
| Trial→paid conversion | `trial_converted` merchants ÷ `merchant_signup` | events |
| Repeat-visit uplift | returning customers ÷ total (baseline vs after enrollment) | `StampEvent` |
| Card completion rate | cards with ≥1 completed cycle ÷ total cards | `StampCard.cyclesDone` |
| Scan→redemption rate | `reward_claimed` ÷ `reward_unlocked` | analytics overview |
| Avg scans / customer | granted stamp events ÷ distinct customers | `StampEvent` |
| Average reward liability | unlocked − claimed rewards (open liability) | `RewardRedemption` |
| Monthly active merchants | tenants with any `stamp_granted` in 30d | events |
| Monthly active customers | distinct customers with `stamp_granted` in 30d | events |
| Branch performance index | 30-day granted stamps + claimed rewards per branch | `/branches/leaderboard` |
| Review conversion | `review_submitted` ÷ `review_clicked` | `/growth/merchant/summary` |
| Social-follow conversion | follows ÷ social clicks | `SocialAction` |
| Churn by tier | cancelled subs ÷ active subs per plan | `Subscription` |
| Campaign ROI estimate | reward cost × claims vs incremental repeat visits | derived (Phase 2) |

The merchant **Overview** and **Analytics** pages surface scans (day/week/month), active vs
repeat customers, redemption rate, avg visits, new vs returning, popular visit hours, top
campaigns, and the branch performance index — all live from these events.
