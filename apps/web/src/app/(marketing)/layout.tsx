import Link from 'next/link';
import { Logo } from '@/components/ui';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Sticky pill nav. On mobile the business/customer switch gets its own
          row — hiding it was leaving phone users with no way to tell the two
          logins apart. */}
      <div className="sticky top-0 z-50 flex justify-center bg-gradient-to-b from-canvas via-canvas/80 to-transparent px-4 py-4 backdrop-blur-sm sm:px-6">
        <nav className="w-full max-w-6xl rounded-[28px] border-2 border-ink bg-surface px-4 py-2.5 shadow-hard md:rounded-full md:pl-5 md:pr-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-1 items-center"><Logo size="sm" /></Link>
            <div className="hidden items-center gap-1 rounded-full bg-brand-soft p-1 md:flex">
              <Link href="/" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">For businesses</Link>
              <Link href="/app" className="rounded-full px-4 py-2 text-sm font-semibold text-ink">For customers</Link>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <Link href="/login" className="px-2 py-2 text-sm font-semibold text-ink hover:text-brand sm:px-3.5">Log in</Link>
              <Link href="/start" className="btn-brand !px-4 !py-2 text-[13px] sm:!py-2.5 sm:text-sm">Start free trial</Link>
            </div>
          </div>
          {/* Mobile-only switch row: makes "which login am I?" obvious. */}
          <div className="mt-2 flex items-center gap-1 rounded-full bg-brand-soft p-1 md:hidden">
            <Link href="/" className="flex-1 rounded-full bg-ink px-3 py-1.5 text-center text-[13px] font-semibold text-white">For businesses</Link>
            <Link href="/app" className="flex-1 rounded-full px-3 py-1.5 text-center text-[13px] font-semibold text-ink">For customers</Link>
          </div>
        </nav>
      </div>

      {children}

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-14 pt-16">
        <div className="grid gap-8 border-b border-line pb-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3.5 max-w-[260px] text-sm text-muted">QR loyalty for local businesses. Scan, stamp, reward — no app required.</p>
          </div>
          <FooterCol title="Product" links={[['Features', '/#features'], ['How it works', '/#how'], ['Pricing', '/pricing'], ['Customer app', '/app']]} />
          <FooterCol title="Company" links={[['Merchant dashboard', '/dashboard'], ['Operator admin', '/admin'], ['Contact', '/start']]} />
          <FooterCol title="Legal" links={[['Terms', '/legal/terms'], ['Privacy', '/legal/privacy']]} />
        </div>
        <div className="pt-6 text-[13px] text-muted">© {new Date().getFullYear()} Rewrd. All rights reserved.</div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <ul className="space-y-2.5 text-sm text-muted">
        {links.map(([l, h]) => <li key={h + l}><Link href={h} className="hover:text-ink">{l}</Link></li>)}
      </ul>
    </div>
  );
}
