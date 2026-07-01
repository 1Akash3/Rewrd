'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import type { Plan } from '@/lib/types';
import { Badge, Button, Card, Spinner } from '@/components/ui';
import { dateStr, inr } from '@/lib/format';

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const load = () => Promise.all([merchantApi.plans(), merchantApi.subscription(), merchantApi.invoices()])
    .then(([p, s, i]) => { setPlans(p); setSub(s); setInvoices(i); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function subscribe(code: string) {
    setMsg('');
    try { await merchantApi.subscribe(code, 'WELCOME20'); setMsg('✓ Subscribed! Invoice generated.'); load(); }
    catch (e: any) { setMsg(e.message); }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Billing</h1>
        <p className="text-sm text-muted">Manage your subscription, plan and GST invoices.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <p className="text-xl font-bold text-ink">{sub?.plan?.name ?? 'Trial'} <Badge tone={sub?.status === 'active' ? 'active' : 'low'}>{sub?.status ?? 'trialing'}</Badge></p>
            {sub?.renewsAt && <p className="text-xs text-muted">Renews {dateStr(sub.renewsAt)}</p>}
          </div>
        </div>
      </Card>

      {msg && <p className={`rounded-md px-3 py-2 text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger'}`}>{msg}</p>}

      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((p) => (
          <Card key={p.id} className={`flex flex-col p-5 ${sub?.plan?.code === p.code ? 'ring-2 ring-brand' : ''}`}>
            <h3 className="font-bold text-ink">{p.name}</h3>
            <p className="mt-1 text-2xl font-extrabold text-ink">{p.priceYearly > 0 ? <>{inr(p.priceYearly)}<span className="text-xs font-normal text-muted">/yr</span></> : 'Custom'}</p>
            <p className="mt-2 flex-1 text-sm text-muted">{p.maxBranches === -1 ? 'Unlimited' : p.maxBranches} locations · {p.maxCampaigns} campaigns</p>
            <Button variant={sub?.plan?.code === p.code ? 'outline' : 'brand'} disabled={sub?.plan?.code === p.code} className="mt-4" onClick={() => subscribe(p.code)}>
              {sub?.plan?.code === p.code ? 'Current plan' : 'Choose'}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-semibold text-ink">Invoices (GST-compliant)</div>
        {invoices.length === 0 ? <p className="p-6 text-center text-sm text-muted">No invoices yet.</p> : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">GST</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{i.number}</td>
                  <td className="px-4 py-3 text-ink">{inr(i.amount)}</td>
                  <td className="px-4 py-3 text-muted">{inr(i.gstAmount)}</td>
                  <td className="px-4 py-3"><Badge tone={i.status === 'paid' ? 'active' : 'low'}>{i.status}</Badge></td>
                  <td className="px-4 py-3 text-muted">{dateStr(i.issuedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
