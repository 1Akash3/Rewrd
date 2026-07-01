'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import type { Campaign } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import { num } from '@/lib/format';

const types = ['visit', 'purchase', 'spend', 'referral', 'review', 'social', 'birthday', 'welcome', 'scratch', 'tiered'];
const templates = [
  { name: 'Buy 8 get 1 free', stampsRequired: 8, rewardTitle: 'Free item', type: 'visit' },
  { name: 'Buy 5 get 1 free', stampsRequired: 5, rewardTitle: 'Free item', type: 'visit' },
  { name: 'First-visit welcome', stampsRequired: 1, rewardTitle: 'Welcome gift', type: 'welcome' },
];

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const load = () => merchantApi.campaigns().then(setItems);
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Campaigns</h1>
          <p className="text-sm text-muted">Create loyalty programs with flexible stamp rules.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New campaign'}</Button>
      </div>

      {showForm && <CampaignForm onDone={() => { setShowForm(false); load(); }} />}

      {!items ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="No campaigns yet" hint="Create your first loyalty program to start collecting stamps." action={<Button onClick={() => setShowForm(true)}>Create campaign</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{c.name}</h3>
                  <p className="text-xs capitalize text-muted">{c.type} campaign</p>
                </div>
                <Badge tone={c.status === 'active' ? 'active' : 'low'}>{c.status}</Badge>
              </div>
              <div className="mt-4 rounded-md bg-canvas p-3 text-sm">
                <p className="text-ink">🎁 <span className="font-medium">{c.rewardTitle}</span></p>
                <p className="mt-1 text-muted">after {c.stampsRequired} stamps</p>
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted">
                <span>{num(c._count?.cards ?? 0)} customers</span>
                <span>{num(c._count?.stampEvents ?? 0)} stamps</span>
                <span>{num(c._count?.redemptions ?? 0)} rewards</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: '', type: 'visit', stampsRequired: 8, rewardTitle: '', rewardDetail: '', cooldownMinutes: 30, perCustomerDailyLimit: 1, requireStaffApproval: false, geoValidation: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await merchantApi.createCampaign(f as any); onDone(); }
    catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted">Quick templates:</span>
        {templates.map((t) => (
          <button key={t.name} type="button" className="chip bg-brand-soft text-brand hover:brightness-95" onClick={() => setF((x) => ({ ...x, ...t }))}>{t.name}</button>
        ))}
      </div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <Field label="Campaign name"><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} required placeholder="Buy 8 get 1 free coffee" /></Field>
        <Field label="Type">
          <select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Reward title"><input className="input" value={f.rewardTitle} onChange={(e) => set('rewardTitle', e.target.value)} required placeholder="Free coffee" /></Field>
        <Field label="Stamps required"><input className="input" type="number" min={1} max={50} value={f.stampsRequired} onChange={(e) => set('stampsRequired', +e.target.value)} /></Field>
        <Field label="Cooldown (minutes)" hint="Min time between a customer's stamps"><input className="input" type="number" min={0} value={f.cooldownMinutes} onChange={(e) => set('cooldownMinutes', +e.target.value)} /></Field>
        <Field label="Daily limit per customer"><input className="input" type="number" min={0} value={f.perCustomerDailyLimit} onChange={(e) => set('perCustomerDailyLimit', +e.target.value)} /></Field>
        <div className="md:col-span-2"><Field label="Reward details (optional)"><input className="input" value={f.rewardDetail} onChange={(e) => set('rewardDetail', e.target.value)} placeholder="Any regular coffee on the house" /></Field></div>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={f.requireStaffApproval} onChange={(e) => set('requireStaffApproval', e.target.checked)} /> Require staff approval</label>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={f.geoValidation} onChange={(e) => set('geoValidation', e.target.checked)} /> Geo-fence validation</label>
        {err && <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
        <div className="md:col-span-2"><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create campaign'}</Button></div>
      </form>
    </Card>
  );
}
