'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMerchant, logoutMerchant } from '@/lib/useMerchant';
import { NavItem, Spinner } from '@/components/ui';
import { initials } from '@/lib/format';

const nav = [
  ['/dashboard', 'Overview', '▚'],
  ['/dashboard/campaigns', 'Campaigns', '◈'],
  ['/dashboard/customers', 'Customers', '☺'],
  ['/dashboard/rewards', 'Rewards', '🎁'],
  ['/dashboard/qr', 'QR Codes', '▦'],
  ['/dashboard/branches', 'Branches', '🏬'],
  ['/dashboard/staff', 'Staff', '👥'],
  ['/dashboard/analytics', 'Analytics', '📈'],
  ['/dashboard/messages', 'Messages', '✉'],
  ['/dashboard/reviews', 'Reviews & Social', '⭐'],
  ['/dashboard/billing', 'Billing', '💳'],
  ['/dashboard/fraud', 'Fraud & Audit', '🛡'],
  ['/dashboard/settings', 'Settings', '⚙'],
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, tenant } = useMerchant();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner label="Loading dashboard…" /></div>;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-30 w-60 border-r border-line bg-surface p-3 transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 font-bold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-fg">◎</span>
          <span className="truncate">{tenant?.name ?? 'Loyalty OS'}</span>
        </Link>
        <nav className="mt-3 space-y-0.5">
          {nav.map(([href, label, icon]) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
          ))}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/80 px-4 py-3 backdrop-blur">
          <button className="btn-outline md:hidden" onClick={() => setOpen((o) => !o)}>☰</button>
          <div className="flex items-center gap-2">
            {tenant?.status && <span className="chip bg-brand-soft text-brand capitalize">{tenant.status}</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-fg">{initials(user?.name)}</div>
            <button className="btn-ghost text-sm" onClick={() => logoutMerchant(router)}>Log out</button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
