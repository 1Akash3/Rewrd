import Link from 'next/link';

const features = [
  { icon: '📱', title: 'No-app QR stamps', desc: 'Customers scan a QR after paying and collect a stamp instantly — no download, no friction.' },
  { icon: '🎁', title: 'Automatic rewards', desc: 'Rewards unlock the moment the stamp goal is hit. Staff verify with a tap.' },
  { icon: '📊', title: 'Real-time analytics', desc: 'Scans, repeat customers, redemption rate and branch performance — live.' },
  { icon: '🏬', title: 'Multi-branch', desc: 'Shared campaigns with GPS branch detection, branch leaderboards and staff roles.' },
  { icon: '🛡️', title: 'Fraud protection', desc: 'Cooldowns, geo-fencing, velocity checks and device fingerprinting stop stamp abuse.' },
  { icon: '⭐', title: 'Reviews & social', desc: 'Turn happy moments into Google reviews and Instagram follows automatically.' },
];

const steps = [
  ['Sign up & set your reward', 'Pick “buy 8 get 1 free” or any rule in a minute.'],
  ['Print your QR', 'Download a branded poster or table QR for each branch.'],
  ['Customers scan & earn', 'Every visit adds a stamp on their phone.'],
  ['Rewards keep them coming', 'Unlocked rewards bring customers back again and again.'],
];

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip bg-brand-soft text-brand">Trusted by local cafés, salons & gyms</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              Turn one-time visitors into <span className="text-brand">regulars</span>.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Replace paper stamp cards with a QR-first digital loyalty program. Reward loyal customers,
              capture their contact details, and watch repeat visits climb — all from one dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-brand px-6 py-3 text-base">Start 14-day free trial</Link>
              <Link href="/app" className="btn-outline px-6 py-3 text-base">Try the customer app</Link>
            </div>
            <p className="mt-3 text-xs text-muted">No card required • Set up in under 5 minutes</p>
          </div>
          <HeroCard />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
          {[['3.2×', 'more repeat visits'], ['0', 'apps to install'], ['<5 min', 'to launch'], ['100%', 'paperless']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-extrabold text-brand">{v}</p>
              <p className="text-sm text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-bold text-ink">Everything you need to build loyalty</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">One platform for stamps, rewards, customer data, messaging and growth.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-3xl font-bold text-ink">Live in four steps</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <div key={t} className="relative">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-fg">{i + 1}</div>
                <h3 className="mt-3 font-semibold text-ink">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-lg bg-brand px-8 py-12 text-center text-brand-fg">
          <h2 className="text-3xl font-bold">Ready to keep your customers coming back?</h2>
          <p className="mx-auto mt-2 max-w-xl opacity-90">Start your free trial today. No credit card, no risk.</p>
          <Link href="/signup" className="mt-6 inline-flex rounded-md bg-white px-6 py-3 font-semibold text-brand hover:bg-white/90">Start free trial</Link>
        </div>
      </section>
    </main>
  );
}

function HeroCard() {
  const filled = 5, total = 8;
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="card overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-600 text-white">☕</div>
            <div>
              <p className="font-semibold text-ink">Brew &amp; Bean</p>
              <p className="text-xs text-muted">Buy 8 get 1 free coffee</p>
            </div>
          </div>
          <span className="chip bg-amber-100 text-amber-800">Loyal</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold ${i < filled ? 'border-amber-600 bg-amber-600 text-white' : 'border-line text-muted'}`}>{i < filled ? '★' : i + 1}</div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">3 more stamps</span> to a free coffee ☕</p>
        <div className="mt-5 rounded-md bg-canvas p-3 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-md bg-white shadow-card">
            <div className="grid grid-cols-4 gap-0.5">
              {Array.from({ length: 16 }, (_, i) => <span key={i} className={`h-3 w-3 ${[0,1,2,5,7,8,10,13,15].includes(i) ? 'bg-ink' : 'bg-transparent'}`} />)}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Scan to collect your stamp</p>
        </div>
      </div>
    </div>
  );
}
