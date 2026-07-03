'use client';
import { useEffect, useState } from 'react';
import { ChevronDown, Coffee, Croissant, Gift, Minus, Pause, Play, Plus, Scissors, Sparkles } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import type { Campaign } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Spinner, StampProgress } from '@/components/ui';
import { num } from '@/lib/format';

export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState('');
  const load = () => merchantApi.campaigns().then(setItems);
  useEffect(() => { load(); }, []);

  // Pause/resume without leaving the page — a paused campaign disappears from
  // customers' scan screens immediately.
  async function toggleStatus(c: Campaign) {
    setBusyId(c.id);
    try {
      await merchantApi.updateCampaign(c.id, { status: c.status === 'active' ? 'paused' : 'active' });
      await load();
    } catch (e: any) { alert(e.message); }
    setBusyId('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">Campaigns</h1>
          <p className="text-sm text-muted">Your loyalty offers — what customers collect stamps for.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New campaign'}</Button>
      </div>

      {showForm && <CampaignBuilder onDone={() => { setShowForm(false); load(); }} />}

      {!items ? <Spinner /> : items.length === 0 && !showForm ? (
        <EmptyState title="No campaigns yet" hint="Create your first loyalty offer — it takes under a minute." action={<Button onClick={() => setShowForm(true)}>Create campaign</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-head font-bold text-ink">{c.name}</h3>
                  <p className="text-xs capitalize text-muted">{c.type} campaign</p>
                </div>
                <Badge tone={c.status === 'active' ? 'active' : 'low'}>{c.status}</Badge>
              </div>
              <div className="mt-4 rounded-md bg-canvas p-3 text-sm">
                <p className="flex items-center gap-1.5 text-ink"><Gift size={14} className="text-brand" aria-hidden /> <span className="font-medium">{c.rewardTitle}</span></p>
                <p className="mt-1 text-muted">after {c.stampsRequired} stamps</p>
              </div>
              <div className="mt-4 flex justify-between text-xs text-muted">
                <span>{num(c._count?.cards ?? 0)} customers</span>
                <span>{num(c._count?.stampEvents ?? 0)} stamps</span>
                <span>{num(c._count?.redemptions ?? 0)} rewards</span>
              </div>
              <button
                onClick={() => toggleStatus(c)}
                disabled={busyId === c.id}
                className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border-2 py-2 text-xs font-semibold transition ${c.status === 'active' ? 'border-line text-muted hover:border-ink hover:text-ink' : 'border-ink bg-lime text-ink'}`}
              >
                {c.status === 'active'
                  ? <><Pause size={13} aria-hidden /> {busyId === c.id ? 'Pausing…' : 'Pause campaign'}</>
                  : <><Play size={13} aria-hidden /> {busyId === c.id ? 'Resuming…' : 'Resume campaign'}</>}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Builder ----------------------------------
   One decision at a time: pick a preset → name the reward → dial the visit
   count. Sensible protections (30-min cooldown, 1 stamp/day) are applied
   silently; power users can expand "Advanced" to change them. */

const presets = [
  { icon: Coffee, label: 'Café', rewardTitle: 'Free coffee', stampsRequired: 8 },
  { icon: Croissant, label: 'Bakery', rewardTitle: 'Free pastry', stampsRequired: 9 },
  { icon: Scissors, label: 'Salon', rewardTitle: 'Free add-on service', stampsRequired: 6 },
  { icon: Sparkles, label: 'Custom', rewardTitle: '', stampsRequired: 8 },
] as const;

function CampaignBuilder({ onDone }: { onDone: () => void }) {
  const [preset, setPreset] = useState(0);
  const [rewardTitle, setRewardTitle] = useState<string>(presets[0].rewardTitle);
  const [stamps, setStamps] = useState<number>(presets[0].stampsRequired);
  const [customName, setCustomName] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [adv, setAdv] = useState({ cooldownMinutes: 30, perCustomerDailyLimit: 1, requireStaffApproval: false, geoValidation: false, rewardDetail: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // The name writes itself; owners can still override it.
  const autoName = rewardTitle ? `Visit ${stamps} times, get ${rewardTitle.toLowerCase()}` : '';
  const name = customName || autoName;

  function pickPreset(i: number) {
    setPreset(i);
    setRewardTitle(presets[i].rewardTitle);
    setStamps(presets[i].stampsRequired);
    setCustomName('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await merchantApi.createCampaign({ name, type: 'visit', rewardTitle, stampsRequired: stamps, status: 'active', ...adv } as any);
      onDone();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-6">
        {/* 1 — preset */}
        <div>
          <p className="mb-2.5 text-sm font-semibold text-ink">1 · What kind of offer?</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {presets.map((p, i) => {
              const active = preset === i;
              return (
                <button key={p.label} type="button" onClick={() => pickPreset(i)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition ${active ? 'border-ink bg-brand-soft shadow-hard-sm' : 'border-line hover:border-ink/40'}`}>
                  <p.icon size={22} strokeWidth={2.25} className={active ? 'text-brand' : 'text-muted'} aria-hidden />
                  <span className="text-xs font-semibold text-ink">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 — reward */}
        <div>
          <p className="mb-2.5 text-sm font-semibold text-ink">2 · What does the customer get?</p>
          <input className="input" value={rewardTitle} onChange={(e) => setRewardTitle(e.target.value)} required placeholder="e.g. Free coffee" autoFocus={preset === 3} />
        </div>

        {/* 3 — visits, with live stamp-card preview */}
        <div>
          <p className="mb-2.5 text-sm font-semibold text-ink">3 · After how many visits?</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setStamps(Math.max(2, stamps - 1))} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-surface shadow-hard-sm transition active:translate-x-[1px] active:translate-y-[1px]" aria-label="Fewer visits"><Minus size={17} /></button>
            <span className="w-10 text-center font-head text-3xl font-bold text-ink">{stamps}</span>
            <button type="button" onClick={() => setStamps(Math.min(20, stamps + 1))} className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-surface shadow-hard-sm transition active:translate-x-[1px] active:translate-y-[1px]" aria-label="More visits"><Plus size={17} /></button>
          </div>
          <div className="mt-4 rounded-2xl border-[1.5px] border-line bg-canvas p-4">
            <p className="mb-3 text-xs font-semibold text-muted">What your customers will see</p>
            <StampProgress current={Math.min(3, stamps - 1)} total={stamps} />
            <p className="mt-3 text-sm text-muted">{name || 'Your offer'} — <span className="font-semibold text-ink">{rewardTitle || 'reward'}</span> on visit {stamps}</p>
          </div>
        </div>

        {/* name (auto, editable) */}
        <div>
          <p className="mb-2.5 text-sm font-semibold text-ink">Campaign name <span className="font-normal text-muted">(auto — edit if you like)</span></p>
          <input className="input" value={name} onChange={(e) => setCustomName(e.target.value)} required />
        </div>

        {/* advanced, folded away */}
        <div className="rounded-2xl border-[1.5px] border-line">
          <button type="button" onClick={() => setAdvanced((a) => !a)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-muted hover:text-ink">
            Advanced protections <ChevronDown size={16} className={`transition ${advanced ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {advanced && (
            <div className="grid gap-4 border-t-[1.5px] border-line p-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-muted">Cooldown between stamps (minutes)
                <input className="input mt-1.5" type="number" min={0} value={adv.cooldownMinutes} onChange={(e) => setAdv((a) => ({ ...a, cooldownMinutes: +e.target.value }))} />
              </label>
              <label className="text-xs font-semibold text-muted">Max stamps per customer per day
                <input className="input mt-1.5" type="number" min={0} value={adv.perCustomerDailyLimit} onChange={(e) => setAdv((a) => ({ ...a, perCustomerDailyLimit: +e.target.value }))} />
              </label>
              <label className="text-xs font-semibold text-muted md:col-span-2">Reward fine print (optional)
                <input className="input mt-1.5" value={adv.rewardDetail} onChange={(e) => setAdv((a) => ({ ...a, rewardDetail: e.target.value }))} placeholder="e.g. Any regular coffee, dine-in only" />
              </label>
              <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={adv.requireStaffApproval} onChange={(e) => setAdv((a) => ({ ...a, requireStaffApproval: e.target.checked }))} /> Staff must approve each stamp</label>
              <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={adv.geoValidation} onChange={(e) => setAdv((a) => ({ ...a, geoValidation: e.target.checked }))} /> Only allow stamps near my store (GPS)</label>
            </div>
          )}
        </div>

        {err && <p className="rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}
        <Button type="submit" disabled={busy || !rewardTitle || !name} className="w-full py-3.5 text-base">{busy ? 'Creating…' : 'Launch campaign'}</Button>
      </form>
    </Card>
  );
}
