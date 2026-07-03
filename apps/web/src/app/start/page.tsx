'use client';
import Link from 'next/link';
import { Store, WalletCards } from 'lucide-react';
import { Logo } from '@/components/ui';

// Entry gateway: choose Business (merchant) or Customer. Customers primarily
// enter via a QR scan, so the "Customer" box routes straight to their app (which
// self-handles OTP) — no separate customer signup flow needed.
export default function StartPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <div className="w-full max-w-[820px]">
        <div className="mb-9 text-center">
          <Link href="/" className="inline-block"><Logo size="lg" className="justify-center" /></Link>
          <h1 className="mt-6 font-head text-4xl font-bold tracking-[-0.03em] text-ink">Welcome — how will you use Rewrd?</h1>
          <p className="mt-2 text-muted">Pick the one that sounds like you.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Business — purple card per the mockup */}
          <div className="flex flex-col rounded-[26px] border-2 border-ink bg-brand p-8 text-white shadow-hard-lg">
            <Store size={38} strokeWidth={2} aria-hidden />
            <h2 className="mb-2 mt-3.5 font-head text-[26px] font-bold">I’m a Business</h2>
            <p className="flex-1 text-[14.5px] leading-relaxed opacity-90">
              Launch a QR loyalty program, manage campaigns and branches, and watch repeat visits climb.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/signup" className="rounded-[14px] border-2 border-ink bg-lime py-3.5 text-center text-[15px] font-bold text-ink">Start 30-day free trial</Link>
              <Link href="/login" className="rounded-[14px] border-2 border-white/40 py-3 text-center text-sm font-semibold text-white hover:border-white">I already have an account</Link>
            </div>
            <p className="mt-3 text-center text-[12.5px] opacity-80">No card required</p>
          </div>

          {/* Customer — white card */}
          <div className="flex flex-col rounded-[26px] border-2 border-ink bg-surface p-8 shadow-hard-lg">
            <WalletCards size={38} strokeWidth={2} className="text-brand" aria-hidden />
            <h2 className="mb-2 mt-3.5 font-head text-[26px] font-bold text-ink">I’m a Customer</h2>
            <p className="flex-1 text-[14.5px] leading-relaxed text-muted">
              Usually you just scan the QR at the counter — no app, no signup. Your rewards live here too.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/app" className="rounded-[14px] border-2 border-ink bg-ink py-3.5 text-center text-[15px] font-bold text-white">Open my rewards</Link>
              <a href="/#how" className="rounded-[14px] border-2 border-ink bg-surface py-3 text-center text-sm font-semibold text-ink">How does scanning work?</a>
            </div>
            <p className="mt-3 text-center text-[12.5px] text-muted">Free forever for customers</p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm">
          <Link href="/" className="font-semibold text-brand hover:underline">← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
