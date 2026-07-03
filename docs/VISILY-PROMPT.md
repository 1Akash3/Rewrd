# Visily Prompt — Rewrd UI

Paste the **Master context** once, then generate each screen using its block. Visily builds
per-screen, so create one frame per block. You supply the design system (colors, fonts, radius,
spacing) — these prompts only define **layout, sections, and real content**.

> Note: there is **no self-serve subscription/checkout screen** (billing is handled offline via
> UPI, access is granted by the operator). Instead there's a read-only "Account & Plan" screen and
> an Admin "manage access" console.

---

## MASTER CONTEXT (paste first)
> I'm designing a SaaS web + mobile product called **Rewrd** — a QR-based digital loyalty
> platform for local businesses (cafés, salons, gyms, bakeries, restaurants, boutiques, car washes).
> Customers scan a QR after a visit, collect digital stamps on their phone with **no app install**,
> and unlock free rewards. Merchants manage campaigns, QR codes, branches, staff, customers and
> analytics from a dashboard. A platform operator grants/suspends merchant access.
> There are **4 surfaces**: (1) marketing website, (2) merchant dashboard (desktop web),
> (3) customer app (mobile, portrait), (4) operator admin console (desktop web).
> Use a clean, premium, trustworthy style with rounded cards, soft shadows, generous spacing,
> progress indicators, and friendly microcopy. Keep copy detailed and realistic, not placeholder.

---

# SURFACE 1 — MARKETING WEBSITE (desktop, responsive)

### 1.1 Landing page
> Long scrolling landing page. Sticky top nav: logo "Rewrd", links (Features, How it works,
> Pricing, Customer app), buttons "Log in" and "Start free trial".
> **Hero (2 columns):** left — eyebrow chip "For cafés, salons, gyms, bakeries & more", H1
> "Turn every visit into a repeat customer", subtext about launching a QR loyalty program in
> minutes with no app download, two buttons "Start free trial" / "View live demo", small note
> "30-day free trial. No payment required to start." Right — a phone/loyalty-card mockup showing a
> stamp card (5 of 8 stamps filled) for "Brew & Bean — Buy 8 get 1 free coffee" and a QR code.
> **Stat strip:** 4 stats — "3.2× more repeat visits", "0 apps to install", "<5 min to launch",
> "100% paperless".
> **How it works (4 numbered steps):** Customer visits & pays → Scans your QR → Progress saves
> automatically → Unlocks a reward. Add a supporting line about no paper cards.
> **Features grid (10 cards, icon + title + 1–2 lines):** Digital Stamp Cards, No App Download
> Needed, QR Code Loyalty Flow, Real-Time Analytics, Multi-Branch Support, Branch-Wise Performance,
> AI Digital Menu, Digital Scratch Cards, Reviews & Social Actions, Unlimited QR Scans.
> **Business categories (7 chips/cards):** Cafés, Salons, Bakeries, Restaurants, Gyms, Car washes,
> Boutiques — each with a tiny reward example.
> **Dashboard preview (2 columns):** heading "See exactly how your loyalty program is performing",
> list of metric labels on one side, a mock metrics panel (Today's scans 128, Repeat rate 61%,
> Rewards claimed 43, Active members 892, Redemption 74%, Top branch MG Road) on the other.
> **Multi-branch + engagement (2 cards):** "One QR for all your branches" with 4 bullet points;
> "Go beyond stamps" with chips AI Digital Menu / Scratch Cards / Reviews & Social.
> **Pricing teaser (4 mini cards, no checkout):** Basic ₹999/yr (1 location), Growth ₹2,499/yr
> (up to 3), Pro ₹4,999/yr (up to 6), Enterprise Custom (unlimited) — button "See full pricing".
> **FAQ (accordion, 7 items):** what is it, no app needed, how rewards work, one QR for branches,
> analytics, free trial, free for customers.
> **Final CTA band:** "Start building customer loyalty in minutes", buttons "Start free trial" /
> "Book a demo". Footer with product links, legal (Terms, Privacy).

### 1.2 Role selection ("/start")
> Simple centered page, logo on top, H1 "Welcome — how will you use Rewrd?". Two large choice
> cards side by side. Card A "I'm a Business" (icon 🏬, description, primary button "Start 30-day
> free trial", secondary "I already have an account", note "No card required"). Card B "I'm a
> Customer" (icon 🎴, text explaining they usually just scan the QR at the counter — no app, no
> signup, buttons "Open my rewards" and "How does scanning work?", note "Free forever for
> customers"). Link back to homepage.

### 1.3 Pricing page
> Header "Simple annual pricing", subtext "Every plan starts with a 30-day free trial — no payment
> required to start." 4 plan cards: Basic ₹999, Growth ₹2,499, Pro ₹4,999 (mark "Popular"),
> Enterprise "Custom". Each lists included features with checkmarks (stamp cards, AI digital menu,
> scratch cards, unlimited QR scans, analytics dashboard, free QR stand; Growth adds same QR across
> branches, GPS branch detection, branch-wise analytics, priority support; Pro adds account manager,
> white-label; Enterprise adds SSO, custom). Buttons say "Start free trial" (not "Buy"). Below: a
> short FAQ and a "Talk to us" contact band.

### 1.4 Login & Signup
> **Login:** centered card, email + password, "Log in" button, link to signup, small "forgot
> password". **Signup:** 2-step wizard. Step 1 business details (business name, business type
> dropdown: café/salon/gym/bakery/restaurant/boutique/car wash/other, owner name). Step 2 account
> (email, phone optional, password). Progress "Step X of 2 · 30-day free trial, no card needed."

---

# SURFACE 2 — MERCHANT DASHBOARD (desktop web, left sidebar layout)

> Persistent **left sidebar** with business name + logo at top and nav items: Overview, Campaigns,
> Customers, Rewards, QR Codes, Branches, Staff, Analytics, Messages, Reviews & Social,
> Account & Plan, Fraud & Audit, Settings. **Top bar:** account status chip (Trial/Active), user
> name + role + avatar, Log out. Content area uses cards and metric tiles.

### 2.1 Overview
> Greeting "Good morning, {Owner} 👋" with subtext "Here's how your loyalty program is doing."
> Row of KPI tiles: Today's scans, This week's scans, Active customers, Repeat customers, Rewards
> unlocked, Redemption rate, Avg visits/customer, Open fraud alerts. A 14-day scan trend line chart.
> Two panels: "New vs returning customers" (donut) and "Popular visit hours" (bar). A "Top campaigns"
> table (name, stamps, rewards, customers). A "Recent activity" feed.

### 2.2 Campaigns (list + builder)
> List of campaign cards: name, type badge (Visit/Purchase/Spend/etc.), status (Active/Paused/Draft),
> stats (total scans, completion rate, rewards redeemed, active members, branch availability), edit
> button. "New campaign" opens a **builder drawer/modal**: campaign name, type, stamps required
> (stepper), reward title + description, reward validity (days), per-customer daily limit, cooldown
> minutes, toggles (require staff approval, geo-validation), branch eligibility (all / pick), start &
> end date, terms. Live preview of the stamp card on the side. Example campaigns to show: "Free
> Coffee After 8 Visits", "Free Dessert After 6 Orders", "Haircut + Free Beard Trim After 8 Visits",
> "5 Gym Check-ins = 1 Free Session", "Buy 9, Get 1 Free Bakery Reward".

### 2.3 Customers (CRM)
> Segment tiles across top (counts): New, Active, Loyal, Almost (near reward), Dormant, VIP.
> Search + segment filter + "Export CSV" button. Table: name, phone, visits, cards, last visit,
> favorite branch, reward progress bar, status tag. Row click → customer detail drawer (profile,
> visit history, rewards, tags, consent status).

### 2.4 Rewards (redemption verification)
> Big "Verify a reward" panel: input/scan a reward code → shows reward title, customer, campaign,
> expiry, status; primary button "Mark as claimed" (with optional staff note); one-time-claim and
> expiry handled. Below: filterable list of redemptions (Unlocked / Claimed / Expired) with
> customer, campaign, date.

### 2.5 QR Codes
> Grid of QR cards: label, kind (Store/Shared/Table/Counter/Bill/Staff), branch, scan count, QR
> image, actions (Download PNG, Download SVG, Print poster, Assign to branch, Test scan flow).
> "Create QR" modal (label, kind, branch, campaign). A "Branded QR poster" preview with the QR,
> business name, and "Scan to collect your stamp" caption. Mention free QR stand for paid plans.

### 2.6 Branches
> Table/cards of branches: name, city, address, geofence radius, scan volume, repeat visitors,
> reward completions, active campaigns, avg visits/customer. "Add branch" modal (name, address, city,
> map location, geofence metres). A branch leaderboard (last 30 days) sorted by stamps.

### 2.7 Staff
> Table: name, email, role (Owner/Branch Manager/Staff/Support), assigned branch, last login, status.
> "Invite staff" modal (name, email, role, branch, temp password). Row menu: edit role/branch,
> disable. A per-staff activity log panel.

### 2.8 Analytics
> Deeper charts: scan trend (selectable range), cohort retention, redemption funnel (enrolled →
> stamping → near reward → unlocked → claimed), branch comparison bars, campaign ROI table, new vs
> returning over time, popular hours heatmap.

### 2.9 Messages (re-engagement)
> Template list (WhatsApp/SMS/Email/Push) with categories: "1 stamp away", reward expiry reminder,
> inactive comeback, festival greeting, review request, branch announcement. Template editor with
> personalization tokens ({name}, {stamps_left}, {reward}). Send/schedule controls, consent/opt-out
> note. A sent-log table.

### 2.10 Reviews & Social
> Growth summary tiles: review clicks, reviews submitted, review conversion %, social clicks,
> referrals. Config: Google review link, social handles (Instagram/Facebook/YouTube/WhatsApp),
> toggle "prompt review after reward". A funnel of review prompt → click → submitted.

### 2.11 Account & Plan (read-only, NO checkout)
> Card showing current plan + status badge, "X days left in free trial" or "Access valid until
> {date}", and a primary button "Contact us to upgrade / renew" (opens WhatsApp). A "How billing
> works" card (1: 30-day free trial, 2: pay annual fee via UPI to the team, 3: we activate/renew
> instantly). A read-only "Available plans" reference grid (no buy buttons), current plan highlighted.

### 2.12 Fraud & Audit
> Fraud alerts table: type (velocity/duplicate/geo/shared device/cooldown/suspicious branch),
> severity, context, status, actions (Review/Dismiss/Action). Below: an immutable audit log
> (actor, action, target, time).

### 2.13 Settings
> Business profile (name, type, brand color, logo upload), GST number, KYC status, notification
> preferences, data & privacy (export, deletion request), danger zone.

### 2.14 Account paused / closed (lock state)
> Full-screen centered card (replaces the dashboard when the operator suspends/terminates): icon,
> H1 "Account paused" or "Account closed", explanation, "Contact Rewrd" button (WhatsApp),
> "Log out".

---

# SURFACE 3 — CUSTOMER APP (mobile, portrait ~390px)

> Mobile PWA. Bottom tab bar: Home (cards), Wallet, Offers, Account. No signup wall — OTP appears
> only when needed (after a scan).

### 3.1 Login (OTP)
> Phone number input + "Send code", then 6-digit OTP input + "Verify". Friendly copy "We'll text you
> a code — no password, no app to install."

### 3.2 Home — My loyalty cards
> Header "Your cards". Vertical list of loyalty cards, each: business logo + name, reward name, a
> row of stamp circles (filled vs empty), progress text "3 more visits to unlock your free reward",
> last visit. Empty state: "Scan a QR at any participating store to start collecting stamps."

### 3.3 Scan result (after scanning a QR)
> Success screen: big checkmark, "You earned a new stamp at Brew Theory Café", updated stamp card
> with the new stamp animated in, progress "2 more visits to unlock your free reward". If threshold
> reached → **Reward unlocked** screen: celebratory, "Reward unlocked: Free Cappuccino", a redeem
> code/QR/barcode to show staff, expiry date, "Show this at the counter". If blocked (cooldown/geo)
> → friendly message explaining why.

### 3.4 Wallet — rewards
> List of rewards: unlocked (with redeem code, expiry, "Show to staff") and claimed/expired history.
> Tabs: Available / History.

### 3.5 Store profile
> Business header (logo, name, category), active loyalty cards, digital menu link, "Follow us"
> social buttons, "Leave a review" button, nearby branches.

### 3.6 Offers / Scratch cards
> Grid of offers and scratch cards. A scratch card interaction screen: "Scratch now to reveal a
> surprise" → reveals a reward. Digital menu viewer (categories, items, prices).

### 3.7 Account & privacy
> Profile (name, email, birthday, anniversary), language, marketing consent toggle, "Download my
> data", "Delete my account", referral link with share button, log out.

---

# SURFACE 4 — OPERATOR ADMIN CONSOLE (desktop web)

### 4.1 Admin overview
> Top bar "Rewrd · Platform Admin". KPI tiles: Merchants (with active/trial split), Customers,
> Stamps issued, (optional) ARR. 

### 4.2 Merchants — manage access
> Search box. Table: business (name + slug), plan, status badge (Trial/Active/Suspended/Cancelled),
> KYC (Verify action if unverified), branches count, and a **Manage access** column with buttons:
> **Activate** (green, when suspended/closed), **Suspend** (amber, with confirm), **Terminate**
> (red, with confirm). Helper text: "Suspend pauses a merchant instantly; Terminate closes the
> account. Collect payment via UPI and grant/renew access here."

### 4.3 Fraud queue (cross-tenant)
> Table of open fraud alerts across all merchants: business, type, severity, time, review actions.

---

## Global instructions for Visily (append to each generation if needed)
> Apply my uploaded design system (colors, typography, spacing, corner radius, buttons). Keep layouts
> responsive. Use real, specific copy as written above. Reuse consistent components (cards, metric
> tiles, tables, badges, progress bars, stamp circles) across screens. Merchant dashboard and admin
> are desktop with a left sidebar; the customer app is mobile portrait with a bottom tab bar.
