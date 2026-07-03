'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import {
  BookOpen, Car, Clover, Coffee, Croissant, CupSoda, Dumbbell, Flower2, Gem, Heart,
  IceCreamCone, Music, PawPrint, Pizza, Repeat, Scissors, Shirt, ShoppingBag, Sparkles,
  Star, Sun, Zap,
} from 'lucide-react';

/* Small, dependency-free primitives that read design tokens from CSS variables.
   Replaceable wholesale by a merged design system — pages import from here only. */

export function Button({
  children, variant = 'brand', className = '', ...props
}: { children: ReactNode; variant?: 'brand' | 'ghost' | 'outline' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = variant === 'brand' ? 'btn-brand' : variant === 'outline' ? 'btn-outline' : 'btn-ghost';
  return <button className={`${cls} ${className}`} {...props}>{children}</button>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

// Rewrd wordmark: red rounded-square "✦" mark + "rewrd" in the display face.
export function Logo({ size = 'md', className = '', mark = true }: { size?: 'sm' | 'md' | 'lg'; className?: string; mark?: boolean }) {
  const box = size === 'lg' ? 'h-9 w-9 text-lg rounded-[11px]' : size === 'sm' ? 'h-[30px] w-[30px] text-[15px] rounded-lg' : 'h-[34px] w-[34px] text-lg rounded-[10px]';
  const word = size === 'lg' ? 'text-[26px]' : size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {mark && <span className={`grid place-items-center bg-red font-bold text-white shadow-hard-sm ${box}`}>✦</span>}
      <span className={`font-head font-bold tracking-[-0.03em] text-ink ${word}`}>rewrd</span>
    </span>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const tagColors: Record<string, string> = {
  vip: 'bg-amber-100 text-amber-800', loyal: 'bg-emerald-100 text-emerald-800',
  new: 'bg-blue-100 text-blue-800', almost: 'bg-violet-100 text-violet-800',
  dormant: 'bg-gray-200 text-gray-700', active: 'bg-sky-100 text-sky-800',
  open: 'bg-red-100 text-red-700', high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-600', unlocked: 'bg-emerald-100 text-emerald-800',
  claimed: 'bg-gray-200 text-gray-700', expired: 'bg-red-100 text-red-700',
  active_status: 'bg-emerald-100 text-emerald-800',
};
export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`chip ${tagColors[tone ?? ''] ?? 'bg-brand-soft text-brand'}`}>{children}</span>;
}

export function StatTile({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? 'ring-1 ring-brand/30' : ''}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </Card>
  );
}

// Skeleton loaders — shimmering placeholders that match the card shapes, so
// pages feel instant instead of showing a spinner.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ink/[0.07] ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="card-data p-4">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-12 w-12 !rounded-[13px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

// Full stamp-card shaped skeleton (customer home).
export function SkeletonStampCard() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <Skeleton className="h-11 w-11 !rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-10 w-10 !rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      {label ?? 'Loading…'}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line py-12 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Pick a unique stamp icon from the business name — every card feels its own.
// Category keywords map to a matching lucide glyph; unmatched names hash into
// a stable pick from a premium fallback set, so no two cards feel generic.
type IconCmp = React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
const STAMP_RULES: [RegExp, IconCmp][] = [
  [/coffee|cafe|café|brew|bean|chai|tea/i, Coffee], [/bak|crumb|bread|pastr|cake|donut/i, Croissant],
  [/salon|hair|glow|beauty|spa|nail/i, Scissors], [/gym|fit|yoga|sport/i, Dumbbell],
  [/pizza|burger|food|kitchen|restaurant|biryani|dosa/i, Pizza], [/wash|car|auto/i, Car],
  [/boutique|fashion|wear|style|cloth/i, Shirt], [/juice|smoothie|shake/i, CupSoda],
  [/ice|gelato|cream/i, IceCreamCone], [/book|read/i, BookOpen], [/pet|paw|vet/i, PawPrint], [/flower|bloom/i, Flower2],
];
const STAMP_FALLBACKS: IconCmp[] = [Sparkles, Star, Heart, Sun, Music, Zap, Clover, Gem];
export function stampIcon(name: string, size = 18): ReactNode {
  let Icon: IconCmp | undefined;
  for (const [re, cmp] of STAMP_RULES) if (re.test(name)) { Icon = cmp; break; }
  if (!Icon) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    Icon = STAMP_FALLBACKS[Math.abs(h) % STAMP_FALLBACKS.length];
  }
  return <Icon size={size} strokeWidth={2.5} aria-hidden />;
}

// Visual stamp-card progress — the signature loyalty component. Filled stamps
// carry the business's unique icon in a bold ink-bordered coin; empty slots
// are dashed placeholders (neo-brutalist, per the Rewrd design system).
export function StampProgress({ current, total, color = 'rgb(var(--brand))', icon }:
  { current: number; total: number; color?: string; icon?: ReactNode }) {
  const dots = Array.from({ length: total }, (_, i) => i < current);
  return (
    <div className="flex flex-wrap gap-2">
      {dots.map((filled, i) => (
        <div
          key={i}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${filled ? 'animate-pop border-ink text-white shadow-hard-sm' : 'border-dashed'}`}
          style={filled ? { background: color } : { borderColor: 'rgb(var(--line))', background: 'rgb(var(--brand-soft) / 0.5)' }}
          title={filled ? `Stamp ${i + 1} collected` : `Visit ${i + 1}`}
        >
          {filled ? (icon ?? <Sparkles size={18} strokeWidth={2.5} aria-hidden />) : ''}
        </div>
      ))}
    </div>
  );
}

// Cute bouncy mascot — a friendly pixel-ish critter in the illustration's
// style. Pure SVG, bobs gently; give it a `color` to match the moment.
export function Mascot({ size = 96, color = '#E8845C', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <div className={`inline-block animate-float ${className}`} style={{ width: size, height: size * 0.8 }} aria-hidden>
      <svg viewBox="0 0 100 80" width="100%" height="100%">
        {/* ears */}
        <rect x="18" y="8" width="14" height="14" rx="4" fill={color} />
        <rect x="68" y="8" width="14" height="14" rx="4" fill={color} />
        {/* body */}
        <rect x="10" y="18" width="80" height="42" rx="14" fill={color} />
        {/* snout side-tab */}
        <rect x="2" y="30" width="12" height="16" rx="5" fill={color} />
        {/* eyes */}
        <rect x="34" y="30" width="9" height="12" rx="3" fill="#1A1A1B" />
        <rect x="58" y="30" width="9" height="12" rx="3" fill="#1A1A1B" />
        {/* legs */}
        <rect x="20" y="60" width="10" height="14" rx="4" fill={color} />
        <rect x="38" y="60" width="10" height="14" rx="4" fill={color} />
        <rect x="56" y="60" width="10" height="14" rx="4" fill={color} />
        <rect x="74" y="60" width="10" height="14" rx="4" fill={color} />
      </svg>
    </div>
  );
}

// Colorful category tiles — straight from the brand illustration
// (Shop / Earn / Repeat / Favourite coins on bright card blocks).
const TILES: [IconCmp, string, string, string][] = [
  [ShoppingBag, 'Shop', '#D5F170', '#1A1A1B'],
  [Sparkles, 'Earn', '#F74445', '#fff'],
  [Repeat, 'Repeat', '#F06706', '#fff'],
  [Heart, 'Reward', '#F0D80B', '#1A1A1B'],
];
export function CategoryTiles({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-4 gap-2.5 ${className}`}>
      {TILES.map(([Icon, label, bg, fg], i) => (
        <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ink px-2 py-3.5 shadow-hard-sm"
          style={{ background: bg, color: fg, animation: `rw-float 5s ease-in-out ${i * 0.35}s infinite` }}>
          <Icon size={24} strokeWidth={2.25} aria-hidden />
          <span className="text-[11px] font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Minimal bar chart (no chart lib — keeps the bundle lean & mergeable).
// Every bar shows its value on top and the peak bar is highlighted, so
// owners can read the chart without hovering or guessing.
export function BarChart({ data, height = 120 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const showValues = data.length <= 16; // don't clutter dense charts
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const peak = d.value === max && max > 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col justify-end" style={{ height: height - 18 }}>
              {showValues && d.value > 0 && (
                <span className={`mb-0.5 text-center text-[9px] font-bold leading-none ${peak ? 'text-brand' : 'text-muted'}`}>{d.value}</span>
              )}
              <div
                className={`w-full rounded-t-[5px] ${peak ? 'bg-brand' : 'bg-brand/30'}`}
                style={{ height: `${(d.value / max) * 82}%`, minHeight: d.value ? 3 : 0 }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className={`text-[9px] ${peak ? 'font-bold text-ink' : 'text-muted'}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function NavItem({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  // Active item = dark pill (Rewrd dashboard mockup).
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-semibold transition ${active ? 'bg-ink text-white' : 'text-muted hover:bg-brand-soft hover:text-ink'}`}>
      <span className="grid w-5 place-items-center">{icon}</span>
      {label}
    </Link>
  );
}
