'use client';
import Link from 'next/link';
import { ReactNode } from 'react';

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

// Visual stamp-card progress — the signature loyalty component.
export function StampProgress({ current, total, color = 'rgb(var(--brand))' }: { current: number; total: number; color?: string }) {
  const dots = Array.from({ length: total }, (_, i) => i < current);
  return (
    <div className="flex flex-wrap gap-2">
      {dots.map((filled, i) => (
        <div
          key={i}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${filled ? 'text-white animate-pop' : 'text-muted'}`}
          style={filled ? { background: color, borderColor: color } : { borderColor: 'rgb(var(--line))' }}
        >
          {filled ? '★' : i + 1}
        </div>
      ))}
    </div>
  );
}

// Minimal SVG bar chart (no chart lib — keeps the bundle lean & mergeable).
export function BarChart({ data, height = 120 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-end" style={{ height: height - 18 }}>
            <div className="w-full rounded-t bg-brand/80" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }} title={`${d.label}: ${d.value}`} />
          </div>
          <span className="text-[9px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${active ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-canvas hover:text-ink'}`}>
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
