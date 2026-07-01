import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-fg">◎</span>
            Loyalty OS
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <a href="/#features" className="hover:text-ink">Features</a>
            <a href="/#how" className="hover:text-ink">How it works</a>
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/app" className="hover:text-ink">Customer app</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Log in</Link>
            <Link href="/start" className="btn-brand">Start free trial</Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-fg">◎</span> Loyalty OS</div>
            <p className="mt-3 max-w-xs text-muted">QR-first digital loyalty for Indian local businesses. Built for cafés, salons, gyms & more.</p>
          </div>
          <FooterCol title="Product" links={[['Features', '/#features'], ['Pricing', '/pricing'], ['Customer app', '/app']]} />
          <FooterCol title="Company" links={[['Merchant login', '/login'], ['Start free trial', '/signup'], ['Admin', '/admin']]} />
          <FooterCol title="Legal" links={[['Terms', '/legal/terms'], ['Privacy', '/legal/privacy']]} />
        </div>
        <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} Loyalty OS. Made for Indian SMBs.</div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="font-semibold text-ink">{title}</p>
      <ul className="mt-3 space-y-2 text-muted">
        {links.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-ink">{l}</Link></li>)}
      </ul>
    </div>
  );
}
