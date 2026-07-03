'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import type { Overview } from '@/lib/types';
import { BarChart, Card, Spinner, StatTile } from '@/components/ui';
import { num } from '@/lib/format';

export default function OverviewPage() {
  const [o, setO] = useState<Overview | null>(null);
  const [trend, setTrend] = useState<{ date: string; scans: number }[]>([]);
  const [breakdown, setBreakdown] = useState<{ newUsers: number; returning: number; popularHours: { hour: number; count: number }[] } | null>(null);
  const [top, setTop] = useState<{ id: string; name: string; stamps: number; rewards: number; customers: number }[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([merchantApi.overview(), merchantApi.trend(), merchantApi.breakdown(), merchantApi.topCampaigns()])
      .then(([a, b, c, d]) => { setO(a); setTrend(b); setBreakdown(c); setTop(d); })
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-danger">{err}</p>;
  if (!o) return <Spinner label="Crunching your numbers…" />;

  const newVsReturn = breakdown ? breakdown.newUsers + breakdown.returning : 0;
  const returnPct = newVsReturn ? Math.round((breakdown!.returning / newVsReturn) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Overview</h1>
        <p className="text-sm text-muted">A plain-language snapshot of how loyalty is performing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Scans today" value={num(o.scansToday)} sub={`${num(o.scansWeek)} this week`} accent />
        <StatTile label="Active customers" value={num(o.activeCustomers)} sub={`${num(o.totalCustomers)} total`} />
        <StatTile label="Repeat customers" value={num(o.repeatCustomers)} sub={`${o.avgVisitsPerCustomer} avg visits`} />
        <StatTile label="Redemption rate" value={`${o.redemptionRate}%`} sub={`${num(o.rewardsClaimed)}/${num(o.rewardsUnlocked)} rewards claimed`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Scans — last 14 days</h2>
            <span className="text-sm text-muted">{num(o.scansMonth)} this month</span>
          </div>
          <BarChart data={trend.map((t) => ({ label: t.date.slice(5), value: t.scans }))} height={160} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">New vs returning</h2>
          <div className="flex items-center justify-center">
            <Donut pct={returnPct} />
          </div>
          <div className="mt-4 flex justify-around text-center text-sm">
            <div><p className="font-bold text-ink">{num(breakdown?.newUsers ?? 0)}</p><p className="text-muted">New</p></div>
            <div><p className="font-bold text-ink">{num(breakdown?.returning ?? 0)}</p><p className="text-muted">Returning</p></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Top campaigns</h2>
          {top.length === 0 ? <p className="text-sm text-muted">No campaign activity yet.</p> : (
            <div className="space-y-3">
              {top.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{num(c.customers)} customers · {num(c.rewards)} rewards</p>
                  </div>
                  <span className="text-sm font-semibold text-brand">{num(c.stamps)} stamps</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Popular visit times</h2>
          <BarChart data={(breakdown?.popularHours ?? []).filter((_, i) => i >= 7 && i <= 22).map((h) => ({ label: `${h.hour}`, value: h.count }))} height={140} />
          {o.openFraudAlerts > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-red/10 px-3 py-2 text-sm text-danger"><ShieldAlert size={15} aria-hidden /> {o.openFraudAlerts} open fraud alert(s) need review.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="14" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(var(--brand))" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} transform="rotate(-90 60 60)" />
      <text x="60" y="66" textAnchor="middle" className="fill-ink" fontSize="22" fontWeight="700">{pct}%</text>
    </svg>
  );
}
