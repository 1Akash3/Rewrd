'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokens } from '@/lib/api';
import { Spinner, SparkleGlyph } from '@/components/ui';
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

  if (err) return <div className="grid min-h-screen place-items-center bg-[#141416] px-5 text-center"><div><p className="text-red">{err}</p><button className="btn-outline mt-4 !bg-white" onClick={() => logoutMerchant(router)}>Switch account</button></div></div>;
  if (!ov) return <div className="grid min-h-screen place-items-center bg-[#141416]"><Spinner label="Loading platform…" /></div>;

  // Dark operator console — per the Rewrd Admin mockup (bg #141416, cards
  // #1e1e21 with #2c2c2f hairlines, lime/purple accents).
  const card = 'rounded-2xl border-[1.5px] border-[#2c2c2f] bg-[#1e1e21]';

  return (
    <div className="min-h-screen bg-[#141416] text-[#f4f2ee]">
      <header className="sticky top-0 z-20 border-b-[1.5px] border-[#2c2c2f] bg-ink px-7 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-red text-white"><SparkleGlyph size={18} /></span>
            <span><span className="font-head text-lg font-bold">rewrd</span> <span className="text-sm font-medium text-[#7a756d]">· Platform Admin</span></span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="rounded-full bg-[#2c2c2f] px-3 py-1.5 text-[12.5px] font-semibold text-lime">Operator</span>
            <button className="text-sm text-[#9a948a] hover:text-white" onClick={() => logoutMerchant(router)}>Log out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-7">
        <h1 className="font-head text-[26px] font-bold">Platform overview</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${card} p-5`}>
            <p className="text-[13px] text-[#9a948a]">Merchants</p>
            <p className="font-head text-[32px] font-bold">{num(ov.tenants)}</p>
            <p className="text-xs text-[#9a948a]"><span className="text-jade">{num(ov.activeTenants)} active</span> · {num(ov.trialTenants)} trial</p>
          </div>
          <div className={`${card} p-5`}>
            <p className="text-[13px] text-[#9a948a]">Customers</p>
            <p className="font-head text-[32px] font-bold">{num(ov.customers)}</p>
          </div>
          <div className={`${card} p-5`}>
            <p className="text-[13px] text-[#9a948a]">Stamps issued</p>
            <p className="font-head text-[32px] font-bold">{num(ov.stamps)}</p>
            <p className="text-xs text-[#9a948a]">all-time</p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-[#4a2f68] bg-[#241a2e] p-5">
            <p className="text-[13px] text-[#c6a8e6]">MRR</p>
            <p className="font-head text-[32px] font-bold text-lime">{inr(ov.annualRecurringRevenue)}</p>
            <p className="text-xs text-[#c6a8e6]">monthly recurring revenue</p>
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[#2c2c2f] px-5 py-3.5">
            <span className="font-head font-bold">Merchants — manage access</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search merchants…"
              className="w-64 rounded-[10px] border-[1.5px] border-[#2c2c2f] bg-[#141416] px-3.5 py-2 text-sm text-[#f4f2ee] outline-none placeholder:text-[#7a756d] focus:border-brand"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-[1.5px] border-[#2c2c2f] text-left text-[11.5px] font-semibold uppercase tracking-wide text-[#7a756d]">
                <tr><th className="px-5 py-3">Business</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">KYC</th><th className="px-4 py-3">Branches</th><th className="px-5 py-3 text-right">Manage access</th></tr>
              </thead>
              <tbody>
                {tenants.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).map((t) => {
                  const closed = t.status === 'cancelled';
                  const suspended = t.status === 'suspended';
                  const stTone = t.status === 'active' ? 'bg-[#12331f] text-[#5fd694]' : t.status === 'trial' ? 'bg-[#3a2f10] text-[#e6c860]' : suspended ? 'bg-[#3a1e1c] text-[#f08b83]' : 'bg-[#26262a] text-[#9a948a]';
                  return (
                    <tr key={t.id} className="border-b border-[#262629] last:border-0 hover:bg-[#232326]">
                      <td className="px-5 py-3.5 font-semibold">{t.name}<span className="block text-xs font-normal text-[#7a756d]">/{t.slug}</span></td>
                      <td className="px-4 py-3.5 text-[#c6c1b8]">{t.subscription?.plan?.name ?? 'Trial'}</td>
                      <td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${stTone}`}>{t.status}</span></td>
                      <td className="px-4 py-3.5">
                        {t.kycStatus === 'verified'
                          ? <span className="text-[13px] text-jade">✓ Verified</span>
                          : <button disabled={busy === t.id} onClick={() => verifyKyc(t.id)} className="rounded-lg border-[1.5px] border-[#4a2f68] px-2.5 py-1 text-xs font-semibold text-[#c6a8e6] hover:bg-[#241a2e]">Verify</button>}
                      </td>
                      <td className="px-4 py-3.5 text-[#9a948a]">{t._count?.branches}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          {(suspended || closed) && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'active')} className="rounded-lg bg-[#1c7a4d] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110">Activate</button>
                          )}
                          {!suspended && !closed && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'suspended', `Pause ${t.name}? They will be locked out until reactivated.`)} className="rounded-lg bg-[#9a7a12] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110">Suspend</button>
                          )}
                          {!closed && (
                            <button disabled={busy === t.id} onClick={() => setStatus(t.id, 'cancelled', `Terminate ${t.name}? This closes the account permanently (data retained for records).`)} className="rounded-lg bg-[#d0362c] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110">Terminate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3.5 text-[12.5px] leading-relaxed text-[#7a756d]">Suspend pauses a merchant instantly; Terminate closes the account. Collect payment via UPI and grant / renew access here.</p>
        </div>
      </main>
    </div>
  );
}
