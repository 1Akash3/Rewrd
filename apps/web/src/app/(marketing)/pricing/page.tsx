'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { inr } from '@/lib/format';
import type { Plan } from '@/lib/types';
import { Spinner } from '@/components/ui';

const featureLabels: [string, string][] = [
  ['maxBranches', 'Branches'],
  ['maxCampaigns', 'Campaigns'],
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  useEffect(() => { merchantApi.plans().then(setPlans).catch(() => setPlans([])); }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ink">Simple annual pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Pick a plan by number of locations. Every plan starts with a 30-day free trial — no payment required to start.</p>
      </div>

      {!plans ? (
        <div className="mt-12 flex justify-center"><Spinner label="Loading plans…" /></div>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {plans.map((p) => (
            <div key={p.id} className={`card flex flex-col p-6 ${p.code === 'growth' ? 'ring-2 ring-brand' : ''}`}>
              {p.code === 'growth' && <span className="chip mb-3 w-fit bg-brand text-brand-fg">Most popular</span>}
              <h3 className="text-lg font-bold text-ink">{p.name}</h3>
              <p className="mt-2 text-3xl font-extrabold text-ink">
                {p.priceYearly > 0 ? <>{inr(p.priceYearly)}<span className="text-sm font-normal text-muted">/yr</span></> : 'Custom'}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
                <li>✓ {p.maxBranches === -1 ? 'Unlimited' : p.maxBranches} location{p.maxBranches === 1 ? '' : 's'}</li>
                <li>✓ {p.maxCampaigns} campaigns</li>
                {Object.entries(p.features).filter(([, v]) => v && v !== 'basic').map(([k]) => (
                  <li key={k}>✓ {k.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())}</li>
                ))}
              </ul>
              <Link href={`/signup?plan=${p.code}`} className={`mt-6 ${p.code === 'growth' ? 'btn-brand' : 'btn-outline'}`}>
                {p.code === 'enterprise' ? 'Contact sales' : 'Start free trial'}
              </Link>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted">All prices exclusive of 18% GST. GST-compliant invoices included. Add-ons available: WhatsApp credits, white-label, API access.</p>
    </main>
  );
}
