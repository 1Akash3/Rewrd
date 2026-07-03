'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import type { Plan } from '@/lib/types';
import { Badge, Card, Spinner } from '@/components/ui';
import { dateStr, inr } from '@/lib/format';

// Account & Plan — read-only. Payment is handled offline (UPI, direct with the
// Rewrd team), and access is granted/renewed by the operator from the admin
// console. No self-serve checkout here by design.
export default function AccountPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([merchantApi.plans(), merchantApi.subscription()])
      .then(([p, s]) => { setPlans(p); setSub(s); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  const trialEnds = sub?.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 864e5)) : null;
  const isTrial = (sub?.status ?? 'trialing') === 'trialing';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Account &amp; Plan</h1>
        <p className="text-sm text-muted">Your current access and plan. Upgrades and renewals are handled directly with our team.</p>
      </div>

      {/* Status */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <p className="text-xl font-bold text-ink">
              {sub?.plan?.name ?? 'Free trial'}{' '}
              <Badge tone={sub?.status === 'active' ? 'active' : 'medium'}>{sub?.status ?? 'trialing'}</Badge>
            </p>
            {isTrial && daysLeft != null && (
              <p className="mt-1 text-xs text-muted">{daysLeft} day{daysLeft === 1 ? '' : 's'} left in your free trial</p>
            )}
            {sub?.renewsAt && !isTrial && <p className="mt-1 text-xs text-muted">Access valid until {dateStr(sub.renewsAt)}</p>}
          </div>
          <a
            href="https://wa.me/917744024465?text=Hi%2C%20I%27d%20like%20to%20upgrade%20my%20Loyalty%20OS%20plan"
            target="_blank" rel="noreferrer"
            className="btn-brand"
          >
            Contact us to upgrade / renew
          </a>
        </div>
      </Card>

      {/* How payment works */}
      <Card className="p-5">
        <h3 className="font-semibold text-ink">How billing works</h3>
        <ol className="mt-3 space-y-2 text-sm text-muted">
          <li><span className="font-medium text-ink">1.</span> Start with a 30-day free trial — full access, no payment.</li>
          <li><span className="font-medium text-ink">2.</span> To continue, pay the monthly plan fee via UPI to our team.</li>
          <li><span className="font-medium text-ink">3.</span> We activate/renew your account instantly once payment is received.</li>
        </ol>
      </Card>

      {/* Plans reference (read-only) */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Available plans</p>
        <div className="grid gap-4 md:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className={`flex flex-col p-5 ${sub?.plan?.code === p.code ? 'ring-2 ring-brand' : ''}`}>
              <h3 className="font-bold text-ink">{p.name}</h3>
              <p className="mt-1 text-2xl font-extrabold text-ink">
                {p.priceYearly > 0 ? <>{inr(p.priceYearly)}<span className="text-xs font-normal text-muted">/mo</span></> : 'Custom'}
              </p>
              <p className="mt-2 flex-1 text-sm text-muted">{p.maxBranches === -1 ? 'Unlimited' : p.maxBranches} location{p.maxBranches === 1 ? '' : 's'} · {p.maxCampaigns} campaigns</p>
              {sub?.plan?.code === p.code && <Badge tone="active">Your plan</Badge>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
