'use client';
import Link from 'next/link';
import { ComponentType, useState } from 'react';
import {
  Bot, ChartColumn, Coffee, Croissant, Car, Dumbbell, Gift, Infinity as InfinityIcon,
  MapPin, Play, QrCode, Scissors, Shirt, Smartphone, Sparkles, Stamp, Star, Store,
  Ticket, UtensilsCrossed, Zap,
} from 'lucide-react';
import { SparkleGlyph } from '@/components/ui';

type Icon = ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;

const features: [Icon, string, string, string][] = [
  [Stamp, 'Digital Stamp Cards', 'Build punch-card programs in any shape — visits, spend or purchase based.', 'bg-surface'],
  [Zap, 'No App Download Needed', 'Customers join in one scan. It just opens in their browser.', 'bg-lime'],
  [QrCode, 'QR Code Loyalty Flow', 'Store, table, counter or bill QR codes — you choose how people scan.', 'bg-surface'],
  [ChartColumn, 'Real-Time Analytics', 'See scans, repeat rate and redemptions update live as they happen.', 'bg-surface'],
  [Store, 'Multi-Branch Support', 'One program across every location, with a single shared QR.', 'bg-brand text-white'],
  [MapPin, 'Branch-Wise Performance', 'Compare branches on scans, repeat visits and rewards side by side.', 'bg-surface'],
  [Bot, 'AI Digital Menu', 'Turn your menu into a scannable, always-current digital experience.', 'bg-surface'],
  [Ticket, 'Digital Scratch Cards', 'Surprise-and-delight rewards customers scratch to reveal.', 'bg-citrine'],
  [Star, 'Reviews & Social Actions', 'Prompt reviews and follows right after a reward is unlocked.', 'bg-surface'],
  [InfinityIcon, 'Unlimited QR Scans', 'Never metered. Scan as much as you grow — on every plan.', 'bg-surface'],
];

const categories: [Icon, string, string, string][] = [
  [Coffee, 'Cafés', 'Buy 8, get 1 free coffee', 'bg-red text-white'],
  [Scissors, 'Salons', '8 cuts = free beard trim', 'bg-brand text-white'],
  [Croissant, 'Bakeries', 'Buy 9, get 1 free', 'bg-citrine text-ink'],
  [UtensilsCrossed, 'Restaurants', 'Free dessert after 6 orders', 'bg-jade text-white'],
  [Dumbbell, 'Gyms', '5 check-ins = 1 free session', 'bg-orange text-white'],
  [Car, 'Car washes', '6 washes, 7th free', 'bg-lime text-ink'],
  [Shirt, 'Boutiques', '₹500 off after 5 visits', 'bg-pink text-white'],
];

const steps: [string, string, string][] = [
  ['1', 'Visits & pays', 'A customer finishes their coffee, haircut or workout — business as usual.'],
  ['2', 'Scans your QR', 'They point their camera at your QR stand. No download, no signup wall.'],
  ['3', 'Progress saves', 'A stamp lands on their digital card instantly — and it’s always there next time.'],
  ['4', 'Unlocks a reward', 'Card complete — they get a free item, and a reason to come straight back.'],
];

const plans: [string, string, string, string][] = [
  ['Basic', '₹999', '1 location', ''],
  ['Growth', '₹2,499', 'Up to 3 locations', ''],
  ['Pro', '₹4,999', 'Up to 6 locations', 'popular'],
  ['Enterprise', 'Custom', 'Unlimited locations', 'dark'],
];

const faqs: [string, string][] = [
  ['What exactly is Rewrd?', 'Rewrd is a QR-based digital loyalty platform for local businesses. Customers scan a QR after a visit, collect digital stamps on their phone with no app install, and unlock free rewards. You manage everything — campaigns, branches, staff and analytics — from one dashboard.'],
  ['Do my customers need to download an app?', 'No. That’s the whole point. When a customer scans your QR, their loyalty card opens right in their phone’s browser. No app store, no signup wall — they can start collecting stamps in seconds.'],
  ['How do rewards work?', 'You decide the rule: visits, purchases or spend. Once a customer completes their stamp card, Rewrd unlocks a reward with a one-time redemption code they show your staff. Expiry and single-use are handled automatically.'],
  ['Can one QR work across all my branches?', 'Yes. A single shared QR works everywhere, and GPS automatically detects which branch a customer visited. Stamps sync instantly across locations, and you can compare branch performance side by side.'],
  ['What analytics do I get?', 'Live scans, repeat rate, redemption rate, active members, popular visit hours, branch comparisons, campaign performance and fraud alerts — all updating in real time in your dashboard.'],
  ['Is there really a free trial?', 'Every plan starts with a 30-day free trial and no payment is required to start. When you’re ready to continue, you pay the monthly fee and we activate your plan instantly.'],
  ['Is Rewrd free for my customers?', 'Always. Customers never pay to join or use a loyalty program. Scanning, collecting stamps and redeeming rewards is completely free for them, forever.'],
];

const marquee = ['SOMETHING BIG IS BREWING', 'RESERVE YOUR SPOT', 'NO APP TO INSTALL', 'SCAN · STAMP · REWARD'];
const marqueeColors = ['text-white', 'text-lime', 'text-white', 'text-citrine'];

export default function LandingPage() {
  const [open, setOpen] = useState(0);

  return (
    <main className="text-ink">
      {/* ===== HERO ===== */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-6 pt-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lime px-3.5 py-1.5 text-[13px] font-semibold shadow-hard-sm">
            <Coffee size={15} strokeWidth={2.5} aria-hidden /> For cafés, salons, gyms, bakeries &amp; more
          </span>
          <h1 className="mt-5 font-head text-5xl font-bold leading-[0.98] tracking-[-0.035em] md:text-[66px]">
            Turn every visit into a <span className="text-brand">repeat</span> customer.
          </h1>
          <p className="mt-5 max-w-[480px] text-lg leading-relaxed text-[#4a4a4d]">
            Launch a QR loyalty program in minutes. Customers scan after a visit, collect digital stamps on their phone — <strong className="text-ink">no app download</strong> — and unlock free rewards they’ll actually come back for.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Link href="/start" className="btn-dark px-6 py-4 text-base">Start free trial <span aria-hidden>→</span></Link>
            <Link href="/app" className="btn-outline px-6 py-3.5 text-base"><Play size={16} strokeWidth={2.5} aria-hidden /> View live demo</Link>
          </div>
          <p className="mt-5 flex items-center gap-2.5 text-[13px] font-medium text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-jade" />
            30-day free trial. No payment required to start.
          </p>
        </div>
        <HeroPanel />
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="mt-9 overflow-hidden border-y-2 border-ink bg-ink py-3.5">
        <div className="flex w-max animate-marquee whitespace-nowrap font-head text-xl font-bold text-white">
          {[0, 1].map((track) => (
            <div key={track} className="flex" aria-hidden={track === 1}>
              {marquee.map((word, i) => <span key={i} className={`px-6 ${marqueeColors[i]}`}>{word} <span className="pl-10 text-white/40" aria-hidden>✦</span></span>)}
            </div>
          ))}
        </div>
      </div>

      {/* ===== STAT STRIP ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value="3.2×" label="more repeat visits" className="bg-lime" />
          <StatCard value="0" label="apps to install" className="bg-surface" />
          <StatCard value={<>&lt;5<span className="text-[22px]"> min</span></>} label="to launch" className="bg-surface" />
          <StatCard value="100%" label="paperless" className="bg-orange text-white" />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="mx-auto mt-24 max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand-soft px-3.5 py-1.5 text-[13px] font-semibold text-brand">HOW IT WORKS</span>
          <h2 className="mt-4 font-head text-4xl font-bold tracking-[-0.03em]">Four taps, zero paper cards</h2>
          <p className="mt-3 text-muted">No more punch cards lost in wallets. Everything lives on your customer’s phone, saved automatically.</p>
        </div>
        <div className="mt-11 grid gap-4 md:grid-cols-4">
          {steps.map(([n, t, d], i) => (
            <div key={t} className={`card p-6 ${i === 3 ? 'bg-jade text-white' : ''}`}>
              <div className={`grid h-11 w-11 place-items-center rounded-xl border-2 border-ink font-head text-xl font-bold ${['bg-red text-white', 'bg-brand text-white', 'bg-orange text-white', 'bg-white text-ink'][i]}`}>{n}</div>
              <h3 className="mt-4 font-head text-xl font-bold">{t}</h3>
              <p className={`mt-1.5 text-sm leading-relaxed ${i === 3 ? 'text-white/95' : 'text-muted'}`}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="mx-auto mt-24 max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-block rounded-full bg-red/15 px-3.5 py-1.5 text-[13px] font-semibold text-red">EVERYTHING INCLUDED</span>
            <h2 className="mt-4 max-w-[520px] font-head text-4xl font-bold tracking-[-0.03em]">One toolkit to grow loyalty</h2>
          </div>
          <p className="max-w-[340px] text-muted">From stamp cards to AI menus and fraud protection — all in a plan that starts free.</p>
        </div>
        <div className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(215px,1fr))]">
          {features.map(([Icon, title, desc, bg]) => (
            <div key={title} className={`rounded-[18px] border-2 border-ink p-5 shadow-hard-sm ${bg}`}>
              <Icon size={26} strokeWidth={2.25} aria-hidden />
              <h3 className="mt-3 font-head text-[17px] font-bold">{title}</h3>
              <p className={`mt-1.5 text-[13.5px] leading-snug ${bg.includes('text-white') ? 'text-white/90' : 'text-muted'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BUSINESS CATEGORIES ===== */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <h2 className="text-center font-head text-4xl font-bold tracking-[-0.03em]">Built for your kind of business</h2>
        <p className="mt-3 text-center text-muted">Whatever you sell, there’s a reward that brings people back.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3.5">
          {categories.map(([Icon, name, offer, bg]) => (
            <div key={name} className={`min-w-[200px] rounded-[18px] border-2 border-ink px-5 py-4 shadow-hard-sm ${bg}`}>
              <Icon size={24} strokeWidth={2.25} aria-hidden />
              <div className="mt-2 font-head text-lg font-bold">{name}</div>
              <div className="text-[13px] opacity-90">{offer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="grid items-center gap-12 rounded-[30px] bg-ink p-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="text-white">
            <span className="inline-block rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold">MERCHANT DASHBOARD</span>
            <h2 className="mt-4 font-head text-[40px] font-bold leading-[1.05] tracking-[-0.03em]">See exactly how your loyalty program is performing</h2>
            <div className="mt-6 flex flex-col gap-3 text-[15px] text-white/85">
              <div className="flex items-center gap-2.5"><span className="text-lime">◆</span> Live scans across every branch</div>
              <div className="flex items-center gap-2.5"><span className="text-citrine">◆</span> Repeat rate &amp; redemption tracking</div>
              <div className="flex items-center gap-2.5"><span className="text-red">◆</span> Top branches &amp; campaigns at a glance</div>
              <div className="flex items-center gap-2.5"><span className="text-jade">◆</span> Fraud alerts flagged automatically</div>
            </div>
          </div>
          <div className="rounded-[20px] bg-white p-5.5" style={{ padding: 22 }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-head text-base font-bold">Today · MG Road HQ</div>
              <div className="rounded-full bg-jade/15 px-2.5 py-1 text-xs font-semibold text-jade">● Live</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["Today's scans", '128', 'bg-brand-soft'], ['Repeat rate', '61%', 'bg-orange/10'], ['Rewards claimed', '43', 'bg-lime/25'], ['Active members', '892', 'bg-jade/10'], ['Redemption', '74%', 'bg-brand-soft'], ['Top branch', 'MG Road', 'bg-red/10']].map(([l, v, bg]) => (
                <div key={l} className={`rounded-[14px] p-3.5 ${bg}`}>
                  <div className="text-xs text-[#7a7a7d]">{l}</div>
                  <div className="font-head text-2xl font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-[70px] items-end gap-1.5">
              {[40, 60, 45, 75, 55, 85, 100].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t ${[3, 5, 6].includes(i) ? 'bg-brand' : 'bg-brand/25'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MULTI-BRANCH + ENGAGEMENT ===== */}
      <section className="mx-auto mt-8 max-w-6xl px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border-2 border-ink bg-brand p-8 text-white shadow-hard-lg">
            <h3 className="mb-4 font-head text-[28px] font-bold">One QR for all your branches</h3>
            <div className="flex flex-col gap-2.5 text-[15px]">
              {['GPS auto-detects which branch was visited', 'Stamps sync across every location instantly', 'Compare branch performance in one view', 'Roll out a campaign everywhere at once'].map((t) => (
                <div key={t} className="flex gap-2.5"><span>✦</span> {t}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border-2 border-ink bg-lime p-8 text-ink shadow-hard-lg">
            <h3 className="mb-4 font-head text-[28px] font-bold">Go beyond stamps</h3>
            <p className="mb-4 text-[15px] text-[#333]">Layer on extra ways to delight customers and grow your reach.</p>
            <div className="flex flex-wrap gap-2.5">
              {['🤖 AI Digital Menu', '🎟️ Scratch Cards', '⭐ Reviews & Social'].map((t) => (
                <span key={t} className="rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-semibold">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING TEASER ===== */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-soft px-3.5 py-1.5 text-[13px] font-semibold text-brand">SIMPLE MONTHLY PRICING</span>
          <h2 className="mt-4 font-head text-4xl font-bold tracking-[-0.03em]">Plans that pay for themselves</h2>
          <p className="mt-3 text-muted">Every plan starts with a 30-day free trial — no payment required to start.</p>
        </div>
        <div className="mt-11 grid items-start gap-4 md:grid-cols-4">
          {plans.map(([name, price, sub, kind]) => {
            const purple = kind === 'popular', dark = kind === 'dark';
            return (
              <div key={name} className={`relative rounded-[22px] border-2 border-ink p-6 shadow-hard ${purple ? 'bg-brand text-white' : dark ? 'bg-ink text-white shadow-hard-brand' : 'bg-surface'}`}>
                {purple && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-lime px-3.5 py-1 text-xs font-bold text-ink">★ POPULAR</span>}
                <div className="font-head text-xl font-bold">{name}</div>
                <div className={`text-[13px] ${purple || dark ? 'opacity-80' : 'text-muted'}`}>{sub}</div>
                <div className="my-4"><span className="font-head text-[34px] font-bold">{price}</span>{price !== 'Custom' && <span className={`text-sm ${purple || dark ? 'opacity-85' : 'text-muted'}`}>/mo</span>}</div>
                <Link href={name === 'Enterprise' ? '/start' : '/start'} className={`block rounded-full border-2 border-ink py-2.5 text-center text-sm font-semibold ${purple ? 'bg-lime text-ink' : dark ? 'bg-white text-ink' : 'bg-surface text-ink'}`}>{name === 'Enterprise' ? 'Talk to us' : 'Start free trial'}</Link>
              </div>
            );
          })}
        </div>
        <div className="mt-7 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-white">See full pricing <span aria-hidden>→</span></Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto mt-24 max-w-[820px] px-6">
        <h2 className="text-center font-head text-4xl font-bold tracking-[-0.03em]">Frequently asked questions</h2>
        <p className="mb-9 mt-2 text-center text-muted">Everything you need to know about how Rewrd helps shoppers earn and businesses grow.</p>
        <div className="flex flex-col gap-3">
          {faqs.map(([q, a], i) => (
            <div key={q} className="overflow-hidden rounded-[18px] border-2 border-ink bg-surface shadow-hard-sm">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5.5 py-5 text-left font-head text-lg font-semibold" style={{ paddingLeft: 22, paddingRight: 22 }}>
                <span>{q}</span>
                <span className="grid h-[30px] w-[30px] flex-shrink-0 place-items-center rounded-full bg-brand-soft text-xl text-brand">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="px-[22px] pb-[22px] text-[15px] leading-relaxed text-[#5a5a5d]">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto mt-22 max-w-6xl px-6" style={{ marginTop: 88 }}>
        <div className="graph-paper-red overflow-hidden rounded-[30px] border-2 border-ink px-8 py-16 text-center text-white shadow-hard-lg">
          <h2 className="font-head text-4xl font-bold leading-none tracking-[-0.035em] md:text-[52px]">Start building customer<br />loyalty in minutes</h2>
          <p className="mb-7 mt-4 text-lg opacity-95">30-day free trial. No card required. Cancel anytime.</p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link href="/start" className="rounded-full bg-ink px-7 py-4 text-base font-semibold text-white shadow-[3px_3px_0_#D5F170]">Start free trial →</Link>
            <Link href="/start" className="rounded-full border-2 border-ink bg-white px-7 py-4 text-base font-semibold text-ink">Book a demo</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ value, label, className = '' }: { value: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`rounded-[20px] border-2 border-ink p-6 shadow-hard ${className}`}>
      <div className="font-head text-[40px] font-bold tracking-[-0.03em]">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

// Purple graph-paper panel with a floating stamp card + "Cha-ching" toast.
function HeroPanel() {
  return (
    <div className="graph-paper relative rounded-[28px] border-2 border-ink p-8 shadow-hard-lg">
      <div className="animate-float rounded-[20px] border-2 border-ink bg-white p-5.5 shadow-hard" style={{ padding: 22 }}>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-ink bg-orange text-white"><Coffee size={22} strokeWidth={2.25} aria-hidden /></div>
          <div>
            <div className="font-head text-lg font-bold">Brew &amp; Bean</div>
            <div className="text-[13px] text-muted">Buy 8, get 1 free coffee</div>
          </div>
        </div>
        <div className="my-5 flex flex-wrap gap-2.5">
          {Array.from({ length: 8 }, (_, i) => i < 5 ? (
            <div key={i} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-red text-white"><SparkleGlyph size={20} /></div>
          ) : (
            <div key={i} className="h-11 w-11 rounded-full border-2 border-dashed border-[#b9a9d1] bg-brand-soft" />
          ))}
        </div>
        <div className="text-[13px] font-semibold text-brand">5 of 8 stamps · 3 more to your free coffee</div>
        <div className="mt-4 flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-[#E3D6F2] bg-[#F9F5FF] p-3">
          <div className="relative h-14 w-14 flex-shrink-0 rounded-lg border-[1.5px] border-ink bg-white">
            <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 border-[3px] border-ink" />
            <div className="absolute right-1.5 top-1.5 h-3.5 w-3.5 border-[3px] border-ink" />
            <div className="absolute bottom-1.5 left-1.5 h-3.5 w-3.5 border-[3px] border-ink" />
            <div className="absolute bottom-2.5 right-2.5 h-2 w-2 bg-ink" />
          </div>
          <div className="text-[12.5px] leading-snug text-[#4a4a4d]">Scan this after your visit to collect a stamp. No app needed.</div>
        </div>
      </div>
      <div className="animate-pop absolute -bottom-3.5 -right-3.5 max-w-[200px] rounded-2xl border-2 border-ink bg-jade px-4 py-3 text-white shadow-hard-sm">
        <div className="flex items-center gap-1.5 font-head text-base font-bold"><Sparkles size={15} strokeWidth={2.5} aria-hidden /> Cha-ching!</div>
        <div className="text-xs opacity-95">Stamp #5 added at Brew &amp; Bean</div>
      </div>
    </div>
  );
}
