# Handoff: Rewrd — QR Loyalty Platform Frontend

## Overview
Rewrd is a QR-based digital loyalty platform for local businesses (cafés, salons, gyms, bakeries, restaurants, etc.). Customers scan a shop's QR after a visit, collect digital stamps on their phone **with no app install**, and unlock free rewards. Merchants manage campaigns, branches, staff, rewards and analytics from a web dashboard. Platform operators manage all merchants from an admin console.

This bundle contains the **complete frontend** across four surfaces:
1. **Marketing site** — landing page, role selection, pricing, login, signup
2. **Merchant dashboard** — 13 views + a paused-account state
3. **Customer app** — mobile web app (no install): cards, explore/map, wallet, offers, account, plus the QR-scan flows and auth
4. **Operator admin** — platform-wide console

## About the Design Files
The files in `designs/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. They are authored as "Design Components" (`.dc.html`) and depend on a runtime (`support.js`) that is specific to the prototyping environment; **do not port `support.js` or the `<x-dc>` / `<sc-if>` / `<sc-for>` template syntax into production.**

Your task is to **recreate these designs in the target codebase's environment** using its established patterns and libraries. If no environment exists yet, the recommended stack is **React + Vite + TypeScript + Tailwind CSS** (the utility classes map cleanly to the inline styles used here), with **React Router** for navigation and **Recharts** (or similar) for the dashboard charts. All charts/graphs in the prototypes are hand-drawn with divs — replace them with a real charting library.

To view a prototype: open any `.dc.html` file in a browser (they self-load the runtime). Use them as the source of truth for layout, spacing, color, copy and interaction.

## Fidelity
**High-fidelity (hifi).** These are pixel-level mockups with final colors, typography, spacing, radii, shadows and interactions. Recreate the UI faithfully. Exact tokens are listed in **Design Tokens** below; component specifics are per-screen.

---

## Design Language / System

**Visual style:** playful, Gen-Z-friendly "neo-brutalist-lite." Chunky 2px black borders, hard offset drop-shadows (e.g. `box-shadow: 4px 4px 0 #1A1A1B`), fully-rounded pill buttons, generous rounded corners (16–26px), bright accent color blocking, and purple graph-paper texture panels.

**Graph-paper panel** (used on hero mockups, QR poster, CTA band):
```css
background-color: #7C44BD;
background-image: linear-gradient(#ffffff22 1px, transparent 1px),
                  linear-gradient(90deg, #ffffff22 1px, transparent 1px);
background-size: 26px 26px;
```

**Card pattern (light):** `background:#fff; border:2px solid #1A1A1B; border-radius:22px; box-shadow:4px 4px 0 #1A1A1B;` — the offset shadow is a signature; keep it on primary cards. Dashboard data cards use a lighter treatment: `border:1.5px solid #ebe5db; border-radius:16px;` with **no** offset shadow (denser, calmer for data).

**Currency:** Indian Rupee (₹). Locale: India (Bengaluru-based sample data).

---

## Typography

- **Headings / numbers / emphasis:** `Familjen Grotesk` (Google Fonts), weight 700, letter-spacing about `-0.02em` to `-0.035em` (tighter as size grows).
- **Body / UI:** `General Sans` (Fontshare), weights 400/500/600/700.
- Font links used in the prototypes:
  - `https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&display=swap`
  - `https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap`

**Type scale (approx, hifi):**
| Use | Font | Size | Weight |
|---|---|---|---|
| Hero H1 | Familjen Grotesk | 52–66px | 700 |
| Section H2 | Familjen Grotesk | 44px | 700 |
| Card/section title | Familjen Grotesk | 16–28px | 700 |
| Big stat number | Familjen Grotesk | 24–40px | 700 |
| Body | General Sans | 14–18px | 400–500 |
| Small / meta | General Sans | 11–13px | 500–600 |

---

## Design Tokens

### Colors (exact hex)
| Token | Hex | Use |
|---|---|---|
| Eerie Black (ink) | `#1A1A1B` | text, borders, dark surfaces |
| Royal Purple | `#7C44BD` | primary brand, links, active nav |
| Imperial Red | `#F74445` | logo mark, alerts, category accents |
| Lime | `#D5F170` | highlight/CTA accents, "popular" badge |
| Citrine (yellow) | `#F0D80B` | accents, bakery category |
| Jade (green) | `#34AD6C` | success, rewards, "ready to redeem" |
| Orange | `#F06706` | accents, gym category |
| Pink | `#ED3B9B` | accents, salon category |
| Map/nav "you" blue | `#2A6FDB` | GPS location dot only |

### Neutral / surface
| Token | Hex | Use |
|---|---|---|
| Marketing page bg | `#FFF9F4` | warm off-white |
| Dashboard page bg | `#F5F1EA` | warm grey |
| Admin page bg | `#141416` / cards `#1e1e21` | dark console |
| Customer app screen bg | `#FFF9F4` | + dotted texture `radial-gradient(#d9c9ee 1.4px, transparent 1.4px)` size `22px` |
| Card border (data) | `#ebe5db` | light hairline |
| Muted text | `#6a655d` / `#8a857c` / `#9a948a` | secondary/tertiary |
| Purple tint bg | `#F3EDF9` / `#EEE3FA` / `#F1EAF9` | chips, pills, soft fills |

### Radii
Buttons/pills: `999px`. Inputs: `10–14px`. Cards: `16–26px`. Icon tiles: `8–15px`.

### Shadows
Signature offset: `4px 4px 0 #1A1A1B` (cards), `3px 3px 0 #1A1A1B` (chips/small), `6px 6px 0 #1A1A1B` (hero/CTA). Phone frame: `0 30px 70px rgba(60,20,90,0.35)`. Map pins: `0 3px 7px rgba(0,0,0,0.28)`.

### Spacing
8px-based rhythm. Common gaps: 8/10/12/14/16/18/24px. Section vertical rhythm on marketing: 88–96px between sections. Content max-width: **1180px** (marketing), **720px** (settings forms).

---

## Screens / Views

### SURFACE 1 — Marketing site

#### 1.1 Landing (`Rewrd Landing.dc.html`)
- **Purpose:** convert business owners to start a free trial.
- **Layout:** centered 1180px column; sticky pill nav at top.
- **Sections in order:**
  1. **Sticky nav** — white pill bar, 2px black border, `4px 4px 0` shadow. Left: logo (red rounded square "✦" + "rewrd" wordmark). Center: segmented toggle "For businesses" (active, dark) / "For customers" (→ links to Customer App). Right: "Log in" (→ Marketing) + "Start free trial" purple pill (→ Marketing).
  2. **Hero** — 2-col grid (1.05 / 0.95). Left: lime pill badge, H1 "Turn every visit into a **repeat** customer." (word "repeat" in purple), subcopy, two CTAs (dark "Start free trial", white "▶ View live demo"), trust line. Right: **graph-paper panel** containing a white stamp-card mockup (Brew & Bean, 5/8 stamps, QR thumbnail) that floats (`@keyframes rw-float`), plus a green "Cha-ching!" toast that pops in (`@keyframes rw-pop`).
  3. **Marquee** — full-bleed black bar, scrolling text (`@keyframes rw-marquee`, 22s linear infinite), alternating white/lime/citrine words.
  4. **Stat strip** — 4 cards (lime / white / white / orange): "3.2× more repeat visits", "0 apps to install", "<5 min to launch", "100% paperless".
  5. **How it works** — 4 numbered cards (steps 1–4), 4th is green.
  6. **Features grid** — 10 cards, auto-fill minmax(215px,1fr), a few color-blocked (lime, purple, citrine).
  7. **Business categories** — 7 colored pill-cards (Cafés/Salons/Bakeries/Restaurants/Gyms/Car washes/Boutiques) each with emoji + example offer.
  8. **Dashboard preview** — dark rounded panel, 2-col: copy + a white mini-dashboard (6 stat tiles + bar chart).
  9. **Multi-branch + engagement** — 2 cards (purple / lime).
  10. **Pricing teaser** — 4 plan cards (Basic/Growth/Pro★/Enterprise), Pro is purple with lime "★ POPULAR" tab; "See full pricing" button (→ Marketing pricing).
  11. **FAQ** — 7-item accordion (single-open). Chevron toggles "+"/"−", answer expands. **State:** `open` index (-1 = none).
  12. **Final CTA** — red graph-paper band, H2 "Start building customer loyalty in minutes", two CTAs.
  13. **Footer** — 4-col link grid + copyright.

#### 1.2 Role select / Pricing / Login / Signup (`Rewrd Marketing.dc.html`)
A single file with a top **page switcher** (demo affordance — in production these are routes: `/get-started`, `/pricing`, `/login`, `/signup`).
- **Role select:** two big cards — "I'm a Business" (purple, → trial/signup) and "I'm a Customer" (white, → Customer App). Both customer buttons link to the customer app.
- **Pricing:** 4 plan cards (same as teaser but full feature lists) + a lime "Not sure which plan fits?" contact band. Billing is handled over UPI (contact-based), not self-serve checkout.
- **Login:** email + password card, "Log in" → **Dashboard**. Link to signup.
- **Signup:** **2-step** wizard with progress bar. Step 1: business name / type / owner name. Step 2: email / phone / password. "Start free trial" → **Dashboard**. **State:** `step` (1|2). Back button returns to step 1.

### SURFACE 2 — Merchant dashboard (`Rewrd Dashboard.dc.html`)
- **Purpose:** merchant runs their loyalty program.
- **Shell:** fixed 250px left **sidebar** (white, logo + business name, 3 nav groups: MAIN / INSIGHTS / ACCOUNT, "Back to site" footer) + main column with sticky top bar (page title, "Trial · N days left" pill, user chip, log out). Active nav item = dark pill. Content area scrolls.
- **State:** `view` string selects the active panel (single-page, no reload). Values: `overview, campaigns, customers, rewards, qr, branches, staff, analytics, messages, reviews, account, fraud, settings, paused`.
- **Views:**
  - **Overview** — greeting, 8 KPI stat cards (one is a red fraud-alert card), 14-day scan bar chart, new-vs-returning donut (`conic-gradient`), popular-hours bars, top-campaigns table, recent-activity feed.
  - **Campaigns** — grid of campaign cards (type badge VISIT/PURCHASE/SPEND + Active/Paused status, 4 mini-stats each) + a dashed "draft" card + "New campaign" button.
  - **Customers** — 6 segment tiles (New/Active/Loyal/Almost/Dormant/VIP), search + segment filter + export, then a customers table (avatar, name, phone, visits, progress bar, favorite branch, status tag).
  - **Rewards** — left: "Verify a reward" (code input → valid-reward card with "Mark as claimed"); right: redemptions table with Unlocked/Claimed/Expired sub-tabs.
  - **QR Codes** — grid of QR cards (label, kind badge, faux QR, branch + scans, PNG/SVG/Poster download buttons) + a branded-poster preview card (purple graph-paper).
  - **Branches** — branches table + a dark "Leaderboard · 30 days" card.
  - **Staff** — team table (name, email, role, branch, status) + "Invite staff".
  - **Analytics** — redemption funnel (horizontal bars), branch comparison (vertical bars), campaign ROI table, period selector.
  - **Messages** — left: template list (WhatsApp/SMS/Email/Push badges); right: template editor with variable chips ({name}, {stamps_left}, {reward}), textarea, Send/Schedule.
  - **Reviews & Social** — 5 metric tiles, config panel (Google review link, social handles, toggle), review funnel bars.
  - **Account & Plan** — dark trial card with progress + "Contact us to upgrade/renew", "How billing works" 3-step card, 4 plan tiles (current = Pro), and a button to preview the **paused** state.
  - **Fraud & Audit** — fraud-alerts table (Velocity/Shared device/Geo mismatch, severity, status, review action) + immutable audit log.
  - **Settings** — business profile form, GST/KYC cards, red "Danger zone" (export / delete).
  - **Paused** (full-screen) — centered card, "Account paused", contact-on-WhatsApp CTA, back-to-demo. This is the locked state when a renewal is pending.

### SURFACE 3 — Customer app (`Rewrd Customer App.dc.html`)
Mobile web app rendered inside a **390×820 phone frame** (frame is a prototype device bezel; in production this is a responsive mobile web page — no install). Notch/status bar are cosmetic.
- **State:** `screen` (`app` | `scan-landing` | `scan-register` | `scan-stamp` | `scan-unlocked` | `login`), `tab` (`home` | `explore` | `wallet` | `offers` | `account`), `scratched` (bool).
- **Tab bar** (bottom, 5 tabs): 🏠 Home · 🗺️ Explore · 🎫 Wallet · 🎁 Offers · 👤 Account. Active = purple.
- **Screens:**
  - **Home** — "Your cards": stacked stamp-card list (purple active card w/ progress dots, white cards), and a "Simulate scanning a shop's QR" button → scan-landing.
  - **Explore** *(GPS discovery)* — a **map** (290px tall, 2px black border): styled streets/park/water, a dashed **1 km radius ring**, colored **map pins** (rounded-teardrop `border-radius:50% 50% 50% 0` rotated −45°, emoji counter-rotated), a blue "you are here" dot with halo, floating chips (area name, recenter ◎, "Showing offers within 1 km"). Below: "N offers nearby / Sorted by distance", horizontal category filter chips, then offer cards (icon tile, name + status tag, offer text, "📍 distance · walk-time"). Tapping a card → scan-landing. **In production:** replace the styled map with Google Maps/Mapbox + real geolocation; keep pin + radius styling.
  - **Wallet** — Available/History tabs; a green "ready to redeem" reward card with a large code (RW-xxxx) + "show at counter", and an "almost there" card.
  - **Offers** — a scratch card (`scratched` toggles reveal → "You won 20% off!"), 2 small offer tiles, digital-menu row.
  - **Account** — profile header, settings list (birthday, language, marketing toggle, refer-a-friend, download data), delete + log out (→ login).
  - **scan-landing** *(the deep-link target — see Auth below)* — faux browser URL bar `rewrd.app/s/brew-bean?b=mg-road&c=free-coffee`, a **returning/first-time toggle**. Returning shows a green "Welcome back, Priya" auto-login banner + only that shop's card + "Collect my stamp". Explains a secure token auto-signs them in.
  - **scan-register** *(first-timer)* — quick registration: shop header, name, phone (+91) with OTP boxes, a **"Keep me signed in on this phone" toggle (on by default)**, "Join & collect my first stamp" → scan-stamp.
  - **scan-stamp** — success: green ✓ (`@keyframes rw-stamp`), confetti (`@keyframes rw-confetti`), updated stamp row, "N more visits", buttons to preview reward-unlocked / done.
  - **scan-unlocked** — full red reward screen: "Reward unlocked!", reward name, faux QR, redemption code, back to cards.
  - **login** — phone + OTP (no password), "Verify & continue" → home. Used as the "switch account" / new-device fallback.

### SURFACE 4 — Operator admin (`Rewrd Admin.dc.html`)
- **Purpose:** platform operator manages all merchants.
- **Shell:** dark console. Top bar (logo + "Platform Admin", "Operator" chip). Tab row: Overview / Merchants · Manage access / Fraud queue. **State:** `view`.
- **Views:**
  - **Overview** — 4 platform KPIs (Merchants, Customers, Stamps issued, ARR — ARR card is purple-tinted with lime number), a 12-week new-merchant bar chart.
  - **Merchants** — search + merchants table (business + slug + branches, plan, status tag, KYC verified/verify, and access actions **Activate / Suspend / Terminate**). Note row explains suspend/terminate and UPI-based access granting.
  - **Fraud queue** — cross-merchant fraud alerts table with Review actions.

---

## Interactions & Behavior

- **Navigation:** marketing pages cross-link via `<a href>`; dashboard & admin switch views via in-memory state (build as routes in production: `/dashboard/campaigns`, `/admin/merchants`, etc.). Customer app switches screens/tabs via state.
- **FAQ accordion:** single item open at a time; clicking an open item closes it. Chevron glyph flips +/−.
- **Signup wizard:** 2 steps, progress bar fills on step 2, back button supported.
- **Customer scan flow:** Home "scan" → scan-landing (returning) OR scan-register (first-time) → scan-stamp → optional scan-unlocked. The returning/first-time toggle on scan-landing lets you preview both arrival states.
- **Scratch card:** click reveals the win state (one-way in the prototype).
- **Animations (all CSS keyframes, defined in each file's `<style>`):**
  - `rw-float` — hero card gentle bob, 5s ease-in-out infinite.
  - `rw-pop` — toast scale-in, 0.6s ease-out.
  - `rw-marquee` — marquee translateX(-50%), 22s linear infinite (duplicate the content track for seamless loop).
  - `rw-stamp` — stamp/reward icon scale+rotate in, 0.6s ease-out.
  - `rw-confetti` — confetti fall+rotate, ~1.4–1.6s ease-in infinite.
- **Hover/active states:** buttons in the prototypes are static; in production apply subtle press (translate toward the shadow, e.g. `translate(2px,2px)` + shrink shadow) to match the offset-shadow language.

## State Management
Prototypes use local component state only. Production state needs:
- **Auth (customer):** persistent token in browser (httpOnly cookie or localStorage) issued at registration → silent auto-login on subsequent scans; phone+OTP fallback on new device. This is the core mechanism the scan-landing / scan-register screens illustrate.
- **Auth (merchant/operator):** standard session/JWT.
- **Dashboard/admin:** current view/route, filters, selected period; data fetched per view (KPIs, campaigns, customers, redemptions, fraud alerts, audit log).
- **Customer app:** active tab/screen, user's cards + progress, wallet rewards, nearby offers (from geolocation), scratch-card state.
- **Deep link:** shop QR encodes `/{shopSlug}?b={branchId}&c={campaignId}`; app reads params to scope the landing to one shop/branch/offer; GPS confirms branch for multi-branch merchants.

## Assets
- **Fonts:** Familjen Grotesk (Google Fonts), General Sans (Fontshare) — links above.
- **Icons/graphics:** all emoji (☕🥐💇🏋️🍕🚗👗🎁🎟️ etc.) and CSS-drawn shapes (QR codes, charts, map, stamp dots) — **no image files**. QR codes are decorative placeholders; generate real QR codes in production. Charts are div-based; replace with a charting library. The map is CSS-styled; replace with a real map SDK.
- **Logo:** wordmark "rewrd" + red rounded-square "✦" mark — recreate as an SVG in production.

## Files
In `designs/`:
- `Rewrd Landing.dc.html` — marketing landing page
- `Rewrd Marketing.dc.html` — role select, pricing, login, signup
- `Rewrd Dashboard.dc.html` — merchant dashboard (13 views + paused)
- `Rewrd Customer App.dc.html` — customer mobile web app (all screens + scan/auth flows + explore map)
- `Rewrd Admin.dc.html` — operator admin console
- `support.js` — prototyping runtime **(reference only; do NOT port to production)**

Open any `.dc.html` in a browser to view the running prototype.
