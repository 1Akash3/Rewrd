# Visily Prompt — Condensed (< 4000 words, single paste)

Design a SaaS product called **Rewrd** — a QR-based digital loyalty platform for local
businesses (cafés, salons, gyms, bakeries, restaurants, boutiques, car washes). Customers scan a QR
after a visit, collect digital stamps on their phone with **no app install**, and unlock free
rewards. Merchants manage everything from a dashboard; a platform operator grants/suspends access.
Style: clean, premium, trustworthy — rounded cards, soft shadows, generous spacing, progress bars,
stamp circles, metric tiles, friendly microcopy. Apply my uploaded design system (colors, fonts,
radius). Use the real copy below, not placeholder text. Reuse consistent components across screens.
There is **no self-serve checkout** (billing is offline via UPI; access is operator-managed).

Generate these screens across 4 surfaces:

## A) Marketing website (desktop, responsive)
1. **Landing** — sticky nav (logo "Rewrd"; links Features, How it works, Pricing, Customer app;
   buttons Log in, Start free trial). Hero 2-col: H1 "Turn every visit into a repeat customer",
   subtext about launching a QR loyalty program in minutes with no app download, buttons "Start free
   trial"/"View live demo", note "30-day free trial. No payment required to start."; right side a
   phone mockup of a stamp card (5 of 8 filled) for "Brew & Bean — Buy 8 get 1 free coffee" plus a
   QR. Stat strip: "3.2× more repeat visits", "0 apps to install", "<5 min to launch", "100%
   paperless". How-it-works 4 numbered steps: visits & pays → scans QR → progress saves → unlocks
   reward. Features grid 10 cards (icon+title+1 line): Digital Stamp Cards, No App Download Needed,
   QR Code Loyalty Flow, Real-Time Analytics, Multi-Branch Support, Branch-Wise Performance, AI
   Digital Menu, Digital Scratch Cards, Reviews & Social Actions, Unlimited QR Scans. Categories row
   (7): Cafés, Salons, Bakeries, Restaurants, Gyms, Car washes, Boutiques (each a tiny reward
   example). Dashboard preview 2-col with a mock metrics panel (Today's scans 128, Repeat rate 61%,
   Rewards claimed 43, Active members 892, Redemption 74%, Top branch MG Road). Two cards: "One QR
   for all your branches" (4 bullets) and "Go beyond stamps" (chips AI Digital Menu/Scratch
   Cards/Reviews & Social). Pricing teaser 4 mini cards: Basic ₹999/yr (1 location), Growth ₹2,499/yr
   (up to 3), Pro ₹4,999/yr (up to 6), Enterprise Custom. FAQ accordion (7 items). Final CTA band
   "Start building customer loyalty in minutes" (buttons Start free trial / Book a demo). Footer.
2. **Role select** — centered, H1 "Welcome — how will you use Rewrd?"; two choice cards: "I'm a
   Business" (button Start 30-day free trial, secondary I already have an account, note No card
   required) and "I'm a Customer" (text: usually you just scan the QR at the counter — no app, no
   signup; buttons Open my rewards / How does scanning work; note Free forever for customers).
3. **Pricing** — 4 plan cards Basic ₹999, Growth ₹2,499, Pro ₹4,999 (mark Popular), Enterprise
   Custom, each with checkmarked features; buttons say "Start free trial" (not Buy). Short FAQ +
   "Talk to us" band.
4. **Login** — email + password, Log in, link to signup. **Signup** — 2-step wizard: step 1 business
   name, business type dropdown (café/salon/gym/bakery/restaurant/boutique/car wash/other), owner
   name; step 2 email, phone (optional), password; note "Step X of 2 · 30-day free trial, no card".

## B) Merchant dashboard (desktop, left sidebar)
Left sidebar: business name+logo, nav = Overview, Campaigns, Customers, Rewards, QR Codes, Branches,
Staff, Analytics, Messages, Reviews & Social, Account & Plan, Fraud & Audit, Settings. Top bar:
status chip (Trial/Active), user name+role+avatar, Log out.
5. **Overview** — greeting "Good morning, Asha 👋". KPI tiles: Today's scans, This week, Active
   customers, Repeat customers, Rewards unlocked, Redemption rate, Avg visits/customer, Open fraud
   alerts. A 14-day scan trend line chart; "New vs returning" donut; "Popular visit hours" bar; Top
   campaigns table; recent activity feed.
6. **Campaigns** — cards (name, type badge, status, stats: scans, completion %, rewards redeemed,
   active members, branch availability, Edit). "New campaign" builder modal: name, type, stamps
   required (stepper), reward title+description, reward validity days, per-customer daily limit,
   cooldown minutes, toggles (staff approval, geo-validation), branch eligibility, start/end date,
   terms; live stamp-card preview. Examples: "Free Coffee After 8 Visits", "Free Dessert After 6
   Orders", "Haircut + Free Beard Trim After 8 Visits", "5 Gym Check-ins = 1 Free Session", "Buy 9,
   Get 1 Free Bakery Reward".
7. **Customers (CRM)** — segment tiles (New, Active, Loyal, Almost, Dormant, VIP) with counts; search
   + filter + Export CSV; table (name, phone, visits, cards, last visit, favorite branch, progress
   bar, status tag); row → detail drawer (profile, history, rewards, tags, consent).
8. **Rewards** — "Verify a reward" panel: enter/scan code → shows reward title, customer, campaign,
   expiry, status; button "Mark as claimed" + note; one-time-claim + expiry enforced. Below:
   redemptions list filterable Unlocked/Claimed/Expired.
9. **QR Codes** — grid of QR cards (label, kind Store/Shared/Table/Counter/Bill/Staff, branch, scan
   count, QR image, actions Download PNG/SVG, Print poster, Assign to branch, Test scan). "Create QR"
   modal. A branded poster preview with QR + "Scan to collect your stamp"; note free QR stand on paid
   plans.
10. **Branches** — cards/table (name, city, address, geofence radius, scan volume, repeat visitors,
    reward completions, active campaigns, avg visits). "Add branch" modal (name, address, city, map,
    geofence metres). Branch leaderboard (30 days).
11. **Staff** — table (name, email, role Owner/Branch Manager/Staff/Support, branch, last login,
    status). "Invite staff" modal (name, email, role, branch, temp password). Per-staff activity log.
12. **Analytics** — scan trend (range picker), cohort retention, redemption funnel (enrolled →
    stamping → near reward → unlocked → claimed), branch comparison bars, campaign ROI table, new vs
    returning over time, popular-hours heatmap.
13. **Messages** — template list (WhatsApp/SMS/Email/Push): "1 stamp away", reward expiry, inactive
    comeback, festival greeting, review request, branch announcement. Editor with tokens ({name},
    {stamps_left}, {reward}); send/schedule; consent note; sent-log table.
14. **Reviews & Social** — tiles (review clicks, reviews submitted, review conversion %, social
    clicks, referrals); config (Google review link, Instagram/Facebook/YouTube/WhatsApp handles,
    toggle "prompt review after reward"); funnel prompt → click → submitted.
15. **Account & Plan (read-only, no checkout)** — card with current plan + status badge, "X days left
    in free trial" or "Access valid until {date}", button "Contact us to upgrade / renew" (WhatsApp);
    "How billing works" card (1: 30-day free trial; 2: pay annual fee via UPI to the team; 3: we
    activate/renew instantly); read-only "Available plans" reference grid (no buy buttons).
16. **Fraud & Audit** — alerts table (type velocity/duplicate/geo/shared device/cooldown/suspicious
    branch, severity, context, status, actions Review/Dismiss/Action); immutable audit log (actor,
    action, target, time).
17. **Settings** — business profile (name, type, brand color, logo upload), GST number, KYC status,
    notification prefs, data & privacy (export, deletion), danger zone.
18. **Account paused/closed (lock state)** — full-screen centered card (replaces dashboard when
    operator suspends/terminates): icon, H1 "Account paused" or "Account closed", explanation,
    "Contact Rewrd" button, Log out.

## C) Customer app (mobile, portrait ~390px, bottom tabs: Home, Wallet, Offers, Account)
19. **Login (OTP)** — phone input + Send code, then 6-digit OTP + Verify; copy "We'll text you a
    code — no password, no app to install."
20. **Home — My cards** — list of loyalty cards (business logo+name, reward name, stamp circles
    filled/empty, "3 more visits to unlock your free reward", last visit). Empty state prompts to
    scan a QR.
21. **Scan result** — success: checkmark, "You earned a new stamp at Brew Theory Café", updated card,
    "2 more visits to unlock". Reward-unlocked variant: celebratory "Reward unlocked: Free
    Cappuccino", redeem code/QR/barcode, expiry, "Show this at the counter". Blocked variant:
    friendly cooldown/geo message.
22. **Wallet** — tabs Available / History; rewards with redeem code, expiry, "Show to staff".
23. **Store profile** — business header (logo, name, category), active cards, digital menu link,
    "Follow us" social buttons, "Leave a review", nearby branches.
24. **Offers / Scratch cards** — grid of offers + scratch cards; scratch interaction "Scratch now to
    reveal a surprise" → reveals reward; digital menu viewer (categories, items, prices).
25. **Account & privacy** — profile (name, email, birthday, anniversary), language, marketing consent
    toggle, "Download my data", "Delete my account", referral link + share, Log out.

## D) Operator admin console (desktop)
26. **Admin overview** — top bar "Rewrd · Platform Admin"; KPI tiles: Merchants (active/trial
    split), Customers, Stamps issued.
27. **Merchants — manage access** — search; table (business name+slug, plan, status badge
    Trial/Active/Suspended/Cancelled, KYC with Verify action, branches count) + a Manage-access
    column with buttons Activate (green), Suspend (amber, confirm), Terminate (red, confirm); helper
    text "Suspend pauses a merchant instantly; Terminate closes the account. Collect payment via UPI
    and grant/renew access here."
28. **Fraud queue** — cross-tenant open fraud alerts table (business, type, severity, time, review
    actions).
