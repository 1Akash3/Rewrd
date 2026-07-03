'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  ChartColumn, Gift, LayoutGrid, Lock, Megaphone, PauseCircle, QrCode, ReceiptText,
  Settings, ShieldAlert, Star, Store, UsersRound, UserRound, ClipboardCheck,
} from 'lucide-react';
import { useMerchant, logoutMerchant } from '@/lib/useMerchant';
import { NavItem, Spinner, SparkleGlyph } from '@/components/ui';
import { initials } from '@/lib/format';

const iconProps = { size: 17, strokeWidth: 2.25 } as const;
const nav: [string, string, ReactNode][] = [
  ['/dashboard', 'Overview', <LayoutGrid key="i" {...iconProps} />],
  ['/dashboard/campaigns', 'Campaigns', <Megaphone key="i" {...iconProps} />],
  ['/dashboard/customers', 'Customers', <UsersRound key="i" {...iconProps} />],
  ['/dashboard/rewards', 'Rewards', <Gift key="i" {...iconProps} />],
  ['/dashboard/approvals', 'Approvals', <ClipboardCheck key="i" {...iconProps} />],
  ['/dashboard/qr', 'QR Codes', <QrCode key="i" {...iconProps} />],
  ['/dashboard/branches', 'Branches', <Store key="i" {...iconProps} />],
  ['/dashboard/staff', 'Staff', <UserRound key="i" {...iconProps} />],
  ['/dashboard/analytics', 'Analytics', <ChartColumn key="i" {...iconProps} />],
  // Messages (WhatsApp/SMS automation) removed for now — needs paid providers.
  ['/dashboard/reviews', 'Reviews & Social', <Star key="i" {...iconProps} />],
  ['/dashboard/billing', 'Account & Plan', <ReceiptText key="i" {...iconProps} />],
  ['/dashboard/fraud', 'Fraud & Audit', <ShieldAlert key="i" {...iconProps} />],
  ['/dashboard/settings', 'Settings', <Settings key="i" {...iconProps} />],
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, tenant } = useMerchant();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner label="Loading dashboard…" /></div>;

  // Access lock: if the operator suspended or terminated this account, replace the
  // dashboard with a clear message (the API also blocks all functional calls).
  if (tenant?.status === 'suspended' || tenant?.status === 'cancelled') {
    const closed = tenant.status === 'cancelled';
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-5">
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-citrine text-ink shadow-hard-sm">{closed ? <Lock size={26} strokeWidth={2.25} /> : <PauseCircle size={26} strokeWidth={2.25} />}</div>
          <h1 className="mt-5 text-xl font-bold text-ink">{closed ? 'Account closed' : 'Account paused'}</h1>
          <p className="mt-2 text-sm text-muted">
            {closed
              ? 'This account has been closed. Your data is retained. Please contact us if this was a mistake.'
              : 'Your account is currently paused. Reactivate by completing your plan payment with our team.'}
          </p>
          <a href="https://wa.me/917744024465?text=Hi%2C%20I%27d%20like%20to%20reactivate%20my%20Rewrd%20account" target="_blank" rel="noreferrer" className="btn-brand mt-5 w-full">Contact Rewrd support</a>
          <button className="btn-ghost mt-2 w-full text-sm" onClick={() => logoutMerchant(router)}>Log out</button>
        </div>
      </div>
    );
  }

  return (
    // Dashboard shell per the Rewrd mockup: warm-grey canvas (#F5F1EA), white
    // sidebar with the logo + business name, dark active nav pill, sticky top
    // bar with a trial/status pill and user chip.
    <div className="min-h-screen bg-[#F5F1EA] md:grid md:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 z-30 flex w-[250px] flex-col border-r-[1.5px] border-line bg-surface p-4 transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-red text-white shadow-hard-sm"><SparkleGlyph size={18} /></span>
          <span className="min-w-0">
            <span className="block font-head text-lg font-bold leading-tight text-ink">rewrd</span>
            <span className="block truncate text-xs text-muted">{tenant?.name ?? 'Your business'}</span>
          </span>
        </Link>
        <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto">
          {nav.map(([href, label, icon]) => (
            <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
          ))}
        </nav>
        <Link href="/" className="px-3 py-2 text-[13px] text-muted hover:text-ink">↩ Back to site</Link>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-[1.5px] border-line bg-[#F5F1EA]/85 px-5 py-3 backdrop-blur">
          <button className="btn-outline !px-3 !py-1.5 md:hidden" onClick={() => setOpen((o) => !o)}>☰</button>
          <div className="flex items-center gap-2">
            {tenant?.status && (
              <span className={`chip capitalize ${tenant.status === 'trial' ? 'border-2 border-ink bg-citrine text-ink' : 'bg-brand-soft text-brand'}`}>
                {tenant.status === 'trial' ? '⏳ Trial' : tenant.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
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
