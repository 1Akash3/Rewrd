'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Badge, Button, Card, Field, Spinner } from '@/components/ui';
import { dateStr } from '@/lib/format';

export default function RewardsPage() {
  const [items, setItems] = useState<any[] | null>(null);
  const [token, setToken] = useState('');
  const [lookup, setLookup] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const load = () => merchantApi.rewards().then(setItems);
  useEffect(() => { load(); }, []);

  async function verify() {
    setMsg(''); setLookup(null);
    try { setLookup(await merchantApi.lookupReward(token.trim())); }
    catch (e: any) { setMsg(e.message); }
  }
  async function claim() {
    try {
      await merchantApi.claimReward(lookup.id ? token.trim() : token.trim());
      setMsg('✓ Reward claimed!'); setLookup(null); setToken(''); load();
    } catch (e: any) { setMsg(e.message); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Rewards</h1>
        <p className="text-sm text-muted">Verify and claim customer rewards at the counter.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold text-ink">Verify a reward</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]"><Field label="Reward code / token"><input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the code from the customer's phone" /></Field></div>
          <Button variant="outline" onClick={verify} disabled={!token}>Look up</Button>
        </div>
        {msg && <p className={`mt-3 rounded-md px-3 py-2 text-sm ${msg.startsWith('✓') ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger'}`}>{msg}</p>}
        {lookup && (
          <div className="mt-4 flex items-center justify-between rounded-md bg-canvas p-4">
            <div>
              <p className="font-semibold text-ink">🎁 {lookup.rewardTitle}</p>
              <p className="text-sm text-muted">{lookup.campaign?.name} · {lookup.customer?.name ?? lookup.customer?.phone}</p>
              <p className="mt-1 text-xs text-muted">Status: <Badge tone={lookup.status}>{lookup.status}</Badge> {lookup.expiresAt && `· expires ${dateStr(lookup.expiresAt)}`}</p>
            </div>
            {lookup.status === 'unlocked' && <Button onClick={claim}>Mark claimed</Button>}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-semibold text-ink">Recent rewards</div>
        {!items ? <div className="p-5"><Spinner /></div> : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No rewards unlocked yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-4 py-3">Reward</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Expires</th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 font-medium text-ink">{r.rewardTitle}</td>
                  <td className="px-4 py-3 text-muted">{r.customer?.name ?? r.customer?.phone}</td>
                  <td className="px-4 py-3 text-muted">{r.campaign?.name}</td>
                  <td className="px-4 py-3"><Badge tone={r.status}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-muted">{dateStr(r.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
