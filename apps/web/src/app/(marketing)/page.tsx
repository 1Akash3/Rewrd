import Link from 'next/link';

const steps = [
  ['Customer visits & pays', 'A customer visits your business and makes a purchase — exactly as they do today.'],
  ['They scan your QR', 'They scan your QR code and instantly collect a digital stamp on their phone. No app to download.'],
  ['Progress saves automatically', 'Their stamp progress is saved automatically, so they keep coming back to complete the reward.'],
  ['They unlock a reward', 'Once they reach the required number of stamps, they unlock and redeem a free reward.'],
];

const features = [
  ['🎴', 'Digital Stamp Cards', 'Create custom loyalty cards with rewards based on visits, purchases, or milestones. Customers collect stamps instantly after each visit.'],
  ['📱', 'No App Download Needed', 'Customers scan your QR and start earning rewards from their phone without installing an app, making adoption faster and easier.'],
  ['▦', 'QR Code Loyalty Flow', 'Print your QR poster or place the QR stand at checkout so customers can scan, collect stamps, and track progress in seconds.'],
  ['📊', 'Real-Time Analytics', 'Track scans, active customers, completed cards, reward claims, and loyalty trends from a single dashboard.'],
  ['🏬', 'Multi-Branch Support', 'Use the same QR across branches and let GPS help detect the customer’s location for branch-level tracking on higher plans.'],
  ['📈', 'Branch-Wise Performance', 'Compare store locations, monitor scan volume, measure repeat activity, and identify your highest-performing branches.'],
  ['🍽️', 'AI Digital Menu', 'Turn your physical menu or service listing into a QR-accessible digital experience for customers.'],
  ['🎟️', 'Digital Scratch Cards', 'Add surprise rewards and interactive scratch experiences to make loyalty feel more exciting and memorable.'],
  ['⭐', 'Reviews & Social Actions', 'Let customers follow your socials and leave reviews right through the loyalty flow, helping you grow beyond repeat visits.'],
  ['♾️', 'Unlimited QR Scans', 'Run high-volume campaigns without worrying about scan limits on core plans.'],
];

const categories = [
  ['☕', 'Cafés', 'Free coffee after 8 visits'],
  ['💇', 'Salons', 'Free add-on after 6 visits'],
  ['🥐', 'Bakeries', 'Buy 9, get 1 free'],
  ['🍽️', 'Restaurants', 'Free dessert after 6 orders'],
  ['🏋️', 'Gyms', '5 check-ins = 1 free session'],
  ['🚗', 'Car washes', 'Free wash after 10 visits'],
  ['👗', 'Boutiques', 'Discount unlock after milestones'],
];

const metrics = ["Today's scans", 'Repeat customers', 'Completed stamp cards', 'Rewards claimed', 'Active loyalty members', 'Redemption rate', 'Branch-wise performance', 'Top performing campaign', 'New vs returning'];

const faqs = [
  ['What is this platform?', 'A digital loyalty system that helps local businesses reward repeat customers using QR-based stamp cards and rewards.'],
  ['Do customers need to download an app?', 'No. Customers scan the QR code and start collecting stamps directly on their phone — no download required.'],
  ['How does the reward system work?', 'You set a rule such as “10 visits = 1 free reward.” Each time a customer visits and scans, they collect a stamp. Once the card is complete, they redeem the reward.'],
  ['Can I use one QR code for multiple branches?', 'Yes. Supported plans include one QR across multiple branches with GPS-based branch detection.'],
  ['What analytics will I get?', 'Track scans, active customers, completed cards, claimed rewards, trends, and branch-wise performance from the dashboard.'],
  ['Is there a free trial?', 'Yes. Businesses start with a 30-day free trial — no payment required to begin.'],
  ['Is it free for customers?', 'Yes. Customers never pay to participate. They just scan and collect rewards.'],
];

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="chip bg-brand-soft text-brand">For cafés, salons, gyms, bakeries &amp; more</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-ink md:text-5xl">
              Turn every visit into a <span className="text-brand">repeat customer</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Launch a QR-based loyalty program in minutes. Let customers scan, collect digital stamps,
              and unlock rewards instantly — no app download required.
            </p>
            <p className="mt-3 max-w-lg text-sm text-muted">
              Replace paper cards, reduce manual tracking, and create a loyalty system your customers
              actually use — from digital stamp cards and reward tracking to branch-wise analytics and
              retention insights, all from one dashboard.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/start" className="btn-brand px-6 py-3 text-base">Start free trial</Link>
              <Link href="/app" className="btn-outline px-6 py-3 text-base">View live demo</Link>
            </div>
            <p className="mt-3 text-xs text-muted">30-day free trial. No payment required to start.</p>
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

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-bold text-ink">How loyalty works in 4 simple steps</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map(([t, d], i) => (
            <div key={t} className="card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-fg">{i + 1}</div>
              <h3 className="mt-3 font-semibold text-ink">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
          No paper cards, no lost punch cards, no manual checking. Just one simple QR-driven experience
          that keeps customers engaged and increases repeat visits.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-3xl font-bold text-ink">Everything you need to run a modern loyalty program</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, title, desc]) => (
              <div key={title} className="card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-xl">{icon}</div>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-bold text-ink">Built for local businesses that grow through repeat visits</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          Encourage regulars to return more often with simple reward milestones — free coffee, a free
          haircut add-on, free dessert, a free class pass, or a discounted service upgrade.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map(([icon, name, reward]) => (
            <div key={name} className="card p-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-2xl">{icon}</div>
              <p className="mt-3 font-semibold text-ink">{name}</p>
              <p className="mt-1 text-xs text-muted">{reward}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-ink">See exactly how your loyalty program is performing</h2>
            <p className="mt-3 text-muted">
              Get a real-time view of customer activity, reward completion, repeat visits, and branch-level
              performance. Instead of guessing whether customers are coming back, see the numbers clearly in one place.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {metrics.map((m) => <div key={m} className="rounded-md bg-canvas px-3 py-2 text-xs font-medium text-ink">{m}</div>)}
            </div>
          </div>
          <div className="card p-5">
            <div className="grid grid-cols-3 gap-3">
              {[["Today's scans", '128'], ['Repeat rate', '61%'], ['Rewards claimed', '43'], ['Active members', '892'], ['Redemption', '74%'], ['Top branch', 'MG Road']].map(([l, v]) => (
                <div key={l} className="rounded-md border border-line p-3">
                  <p className="text-[10px] uppercase text-muted">{l}</p>
                  <p className="mt-1 text-lg font-bold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-branch + AI/scratch */}
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
        <div className="card p-7">
          <h3 className="text-2xl font-bold text-ink">One QR for all your branches</h3>
          <p className="mt-2 text-muted">Manage loyalty across locations without a confusing setup. Use the same QR across stores while the platform identifies branch activity and keeps reporting organized.</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>✓ Unified loyalty across locations</li>
            <li>✓ GPS-based branch detection on supported plans</li>
            <li>✓ Branch-wise scan analytics</li>
            <li>✓ Simple for both owners and customers</li>
          </ul>
        </div>
        <div className="card p-7">
          <h3 className="text-2xl font-bold text-ink">Go beyond stamps with interactive engagement</h3>
          <p className="mt-2 text-muted">Add more reasons to come back. Turn your menu into a QR-first digital experience, launch digital scratch cards for surprise rewards, and make every visit feel engaging instead of transactional.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip bg-brand-soft text-brand">AI Digital Menu</span>
            <span className="chip bg-brand-soft text-brand">Scratch Cards</span>
            <span className="chip bg-brand-soft text-brand">Reviews &amp; Social</span>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="text-3xl font-bold text-ink">Simple annual pricing for growing local businesses</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">All plans include a 30-day free trial with no payment required to start.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[['Basic', '₹999', '1 location'], ['Growth', '₹2,499', 'up to 3 locations'], ['Pro', '₹4,999', 'up to 6 locations'], ['Enterprise', 'Custom', 'unlimited']].map(([n, p, s]) => (
              <div key={n} className="card p-5">
                <p className="font-bold text-ink">{n}</p>
                <p className="mt-1 text-2xl font-extrabold text-brand">{p}<span className="text-xs font-normal text-muted">{p !== 'Custom' ? '/yr' : ''}</span></p>
                <p className="mt-1 text-xs text-muted">{s}</p>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="btn-outline mt-8">See full pricing &amp; features</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center text-3xl font-bold text-ink">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="card group p-5">
              <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                <span className="flex items-center justify-between">{q}<span className="text-brand transition group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-3 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-lg bg-brand px-8 py-12 text-center text-brand-fg">
          <h2 className="text-3xl font-bold">Start building customer loyalty in minutes</h2>
          <p className="mx-auto mt-2 max-w-xl opacity-90">Create your business profile, set your reward, print your QR, and turn everyday visits into repeat business with a loyalty system customers actually use.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/start" className="inline-flex rounded-md bg-white px-6 py-3 font-semibold text-brand hover:bg-white/90">Start free trial</Link>
            <Link href="/app" className="inline-flex rounded-md border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">Book a demo</Link>
          </div>
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
