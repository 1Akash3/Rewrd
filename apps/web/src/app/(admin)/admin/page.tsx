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
  const [busy, setBusy] = useState('');
  const [q, setQ] = useState('');

  function load() {
    Promise.all([api.get<any>('/admin/overview', 'merchant'), api.get<any[]>('/admin/tenants', 'merchant')])
      .then(([o, t]) => { setOv(o); setTenants(t); })
      .catch((e) => setErr(e.status === 403 ? 'This area is for platform super-admins only.' : e.message));
  }

  useEffect(() => {
    if (!tokens.get('merchant')) { router.replace('/login'); return; }
    load();
  }, [router]);

  async function setStatus(id: string, status: string, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(id);
    try {
      await api.patch(`/admin/tenants/${id}`, { status }, 'merchant');
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e: any) { alert(e.message); }
    setBusy('');
  }

  async function verifyKyc(id: string) {
    setBusy(id);
    try {
      await api.patch(`/admin/tenants/${id}`, { kycStatus: 'verified' }, 'merchant');
      setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, kycStatus: 'verified' } : t)));
    } catch (e: any) { alert(e.message); }
    setBusy('');
  }

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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="font-semibold text-ink">Merchants — manage access</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name…"
              className="w-56 rounded-md border border-line bg-canvas px-3 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">KYC</th><th className="px-4 py-3">Branches</th><th className="px-4 py-3 text-right">Manage access</th></tr>
              </thead>
              <tbody>
                {tenants.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).map((t) => {
                  const closed = t.status === 'cancelled';
                  const suspended = t.status === 'suspended';
                  return (
                    <tr key={t.id} className="border-b border-line last:border-0 hover:bg-canvas">
                      <td className="px-4 py-3 font-medium text-ink">{t.name}<span className="block text-xs font-normal text-muted">/{t.slug}</span></td>
                      <td className="px-4 py-3 text-muted">{t.subscription?.plan?.name ?? 'Trial'}</td>
                      <td className="px-4 py-3"><Badge tone={t.status === 'active' ? 'active' : t.status === 'trial' ? 'medium' : 'low'}>{t.status}</Badge></td>
                      <td className="px-4 py-3">
                        {t.kycStatus === 'verified'
                          ? <Badge tone="active">verified</Badge>
                          : <button disabled={busy === t.id} onClick={() => verifyKyc(t.id)} className="text-xs text-brand hover:underline">Verify</button>}
                      </td>
                      <td className="px-4 py-3 text-muted">{t._count?.branches}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {(suspended || closed) && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'active')} className="rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success hover:bg-success/20">Activate</button>
                          )}
                          {!suspended && !closed && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'suspended', `Pause ${t.name}? They will be locked out until reactivated.`)} className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200">Suspend</button>
                          )}
                          {!closed && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'cancelled', `Terminate ${t.name}? This closes the account permanently (data retained for records).`)} className="rounded-md bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/20">Terminate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-muted">Suspend pauses a merchant instantly (they see a "contact us to reactivate" screen). Terminate closes the account. You collect payment via UPI and grant/renew access here.</p>
      </main>
    </div>
  );
}
