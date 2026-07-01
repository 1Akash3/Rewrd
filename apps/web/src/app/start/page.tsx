'use client';
import Link from 'next/link';

// Entry gateway: choose Business (merchant) or Customer. Customers primarily
// enter via a QR scan, so the "Customer" box routes straight to their app (which
// self-handles OTP) — no separate customer signup flow needed.
export default function StartPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-fg">◎</span> Loyalty OS
          </Link>
          <h1 className="mt-5 text-3xl font-bold text-ink">Welcome — how will you use Loyalty OS?</h1>
          <p className="mt-2 text-muted">Pick the option that describes you to get started.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Business */}
          <div className="card group flex flex-col p-7 transition hover:shadow-pop">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-3xl">🏬</div>
            <h2 className="mt-5 text-xl font-bold text-ink">I'm a Business</h2>
            <p className="mt-2 flex-1 text-sm text-muted">
              Café, salon, gym, bakery, restaurant, boutique or store. Launch a QR loyalty program,
              track scans &amp; repeat customers, and manage rewards from one dashboard.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/signup" className="btn-brand w-full">Start 30-day free trial</Link>
              <Link href="/login" className="btn-outline w-full">I already have an account</Link>
            </div>
            <p className="mt-3 text-center text-xs text-muted">No card required to start</p>
          </div>

          {/* Customer */}
          <div className="card group flex flex-col p-7 transition hover:shadow-pop">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-3xl">🎴</div>
            <h2 className="mt-5 text-xl font-bold text-ink">I'm a Customer</h2>
            <p className="mt-2 flex-1 text-sm text-muted">
              Collect stamps and unlock rewards at your favourite local spots. Usually you'll just
              <span className="font-medium text-ink"> scan the QR</span> at the counter — no app,
              no signup. Open your wallet here to see your cards and rewards.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/app" className="btn-brand w-full">Open my rewards</Link>
              <a href="/#how" className="btn-outline w-full">How does scanning work?</a>
            </div>
            <p className="mt-3 text-center text-xs text-muted">Free forever for customers</p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="text-brand hover:underline">← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
