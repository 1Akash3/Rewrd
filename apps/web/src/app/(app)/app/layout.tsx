'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, Gift, House, WalletCards } from 'lucide-react';
import { Logo } from '@/components/ui';

const tabs = [
  ['/app', 'Home', House],
  ['/app/wallet', 'Wallet', WalletCards],
  ['/app/offers', 'Offers', Gift],
  ['/app/account', 'Account', CircleUserRound],
] as const;

// Mobile-first customer shell per the Rewrd mockup: warm off-white screen,
// small logo header, bottom tab bar with purple active state.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-canvas">
      <header className="flex items-center justify-between px-5 pb-1 pt-4">
        <Link href="/app"><Logo size="sm" /></Link>
      </header>
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md justify-around border-t-[1.5px] border-[#efe8f6] bg-surface pb-5 pt-2.5">
        {tabs.map(([href, label, Icon]) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-1 text-[11px] ${active ? 'font-bold text-brand' : 'font-medium text-[#b4adbd]'}`}>
              <Icon size={21} strokeWidth={active ? 2.5 : 2} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
