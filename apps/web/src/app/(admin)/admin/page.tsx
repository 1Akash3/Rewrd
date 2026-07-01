'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokens } from '@/lib/api';
import { Badge, Card, Spinner, StatTile } from '@/components/ui';
import { inr, num } from '@/lib/format';
import { logoutMerchant } from '@/lib/useMerchant';

export default function AdminPage() {
  const router = useRouter();
  const [ov, setOv] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!tokens.get('merchant')) { router.replace('/login'); return; }
    Promise.all([api.get<any>('/admin/overview', 'merchant'), api.get<any[]>('/admin/tenants', 'merchant')])
      .then(([o, t]) => { setOv(o); setTenants(t); })
      .catch((e) => setErr(e.status === 403 ? 'This area is for platform super-admins only.' : e.message));
  }, [router]);

  if (err) return <div className="grid min-h-screen place-items-center px-5 text-center"><div><p className="text-danger">{err}</p><button className="btn-outline mt-4" onClick={() => logoutMerchant(router)}>Switch account</button></div></div>;
  if (!ov) return <div className="grid min-h-screen place-items-center"><Spinner label="Loading platform…" /></div>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">◎</span> Loyalty OS · Platform Admin</div>
          <button className="btn-ghost text-sm" onClick={() => logoutMerchant(router)}>Log out</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Merchants" value={num(ov.tenants)} sub={`${num(ov.activeTenants)} active · ${num(ov.trialTenants)} trial`} accent />
          <StatTile label="Customers" value={num(ov.customers)} />
          <StatTile label="Stamps issued" value={num(ov.stamps)} />
          <StatTile label="ARR" value={inr(ov.annualRecurringRevenue)} sub="annual recurring revenue" />
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-line px-4 py-3 font-semibold text-ink">Merchants</div>
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">KYC</th><th className="px-4 py-3">Branches</th><th className="px-4 py-3">Campaigns</th></tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 font-medium text-ink">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.subscription?.plan?.name ?? 'Trial'}</td>
                  <td className="px-4 py-3"><Badge tone={t.status === 'active' ? 'active' : 'low'}>{t.status}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={t.kycStatus === 'verified' ? 'active' : 'low'}>{t.kycStatus}</Badge></td>
                  <td className="px-4 py-3 text-muted">{t._count?.branches}</td>
                  <td className="px-4 py-3 text-muted">{t._count?.campaigns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
