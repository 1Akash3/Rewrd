'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  ['/app', 'Cards', '🎴'],
  ['/app/wallet', 'Rewards', '🎁'],
  ['/app/offers', 'Offers', '✨'],
  ['/app/account', 'Account', '👤'],
] as const;

// Mobile-first shell with a bottom tab bar — the customer PWA.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around border-t border-line bg-surface/95 py-2 backdrop-blur">
        {tabs.map(([href, label, icon]) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${active ? 'text-brand' : 'text-muted'}`}>
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
