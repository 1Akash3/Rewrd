# Design System

Mobile-first, accessible, trust-building — designed for non-technical Indian SMB owners.

## Tokens (CSS variables — `apps/web/src/app/globals.css`)
Colors are stored as space-separated RGB channels so Tailwind can apply alpha (`bg-brand/20`).

| Token | Default | Use |
|---|---|---|
| `--brand` | `79 70 229` (indigo) | primary actions, active nav; **override per-tenant for white-label** |
| `--brand-soft` | `238 242 255` | subtle brand backgrounds, chips |
| `--ink` | `17 24 39` | primary text |
| `--muted` | `107 114 128` | secondary text |
| `--line` | `229 231 235` | borders |
| `--surface` / `--canvas` | white / `249 250 251` | cards / page |
| `--success` / `--warn` / `--danger` | green / amber / red | status |
| `--radius-lg/md/sm` | 16/10/6px | rounding |

Tailwind maps these to `bg-brand`, `text-ink`, `border-line`, `rounded-lg`, `shadow-card`,
`shadow-pop` (see `tailwind.config.ts`). **No component hardcodes a hex.**

## Component primitives (`apps/web/src/components/ui.tsx`)
`Button` (brand/outline/ghost) · `Card` · `Field` (label+hint) · `Badge` (tone-colored) ·
`StatTile` (KPI) · `Spinner` · `EmptyState` · `StampProgress` (the signature stamp dots with
pop animation) · `BarChart` / donut (dependency-free SVG) · `NavItem`.

Reusable CSS classes in `globals.css`: `.card`, `.input`, `.label`, `.btn-brand/-outline/-ghost`, `.chip`.

## Signature loyalty components
- **StampProgress** — filled ★ dots vs numbered empty slots; `color` prop uses the tenant brand color; new stamps `animate-pop`.
- **Reward card** — brand-tinted header, unique redemption token shown as selectable text for staff.
- **Scan landing** — brand-colored store header + single prominent "Collect my stamp" CTA.
- **KPI tiles + bar/donut charts** — plain-language analytics.

## UX principles
1. **One primary action per screen** — big, obvious, brand-colored.
2. **Progress is always visual** — stamp dots and progress rings, never raw numbers alone.
3. **Low-friction scan** — no app, OTP once, instant feedback with celebration.
4. **Plain language** — "2 more → free coffee", "1 stamp away", not jargon.
5. **Graceful fallback** — clear branch selection if GPS fails; friendly fraud messages.
6. **Accessible** — semantic HTML, focus rings (`focus:ring-brand/20`), sufficient contrast, 44px tap targets on the PWA.

## Theming / white-label
Override the CSS variables at `:root` (globally) or on a wrapper element (per-tenant) — the
entire UI re-skins with no component changes. This is how per-tenant branding and enterprise
white-label are delivered.
