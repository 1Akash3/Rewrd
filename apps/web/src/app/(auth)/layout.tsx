import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand p-10 text-brand-fg md:flex">
        <Link href="/" className="flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">◎</span> Loyalty OS</Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Loyalty that runs itself.</h2>
          <p className="mt-3 max-w-sm opacity-90">Set up a digital stamp card, print your QR, and watch repeat visits grow. Join thousands of local businesses.</p>
          <ul className="mt-6 space-y-2 text-sm opacity-90">
            <li>✓ No app for customers</li>
            <li>✓ Real-time analytics</li>
            <li>✓ Fraud protection built in</li>
          </ul>
        </div>
        <p className="text-sm opacity-70">© {new Date().getFullYear()} Loyalty OS</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
