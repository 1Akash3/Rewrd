import Link from 'next/link';
import { Logo } from '@/components/ui';

// Centered auth card on the warm canvas — per the Rewrd marketing mockup
// (white card, 2px ink border, 6px offset shadow, logo at top).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-10">
      <div className="w-full max-w-[460px] rounded-[26px] border-2 border-ink bg-surface p-9 shadow-hard-lg">
        <Link href="/" className="mb-6 inline-block"><Logo /></Link>
        {children}
      </div>
      <Link href="/" className="mt-7 text-sm font-semibold text-brand hover:underline">← Back to homepage</Link>
    </div>
  );
}
