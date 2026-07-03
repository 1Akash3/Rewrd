'use client';
import { useEffect, useState } from 'react';
import { MapPin, Pencil } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import { Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import { LocationPicker } from '@/components/LocationPicker';
import { num } from '@/lib/format';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[] | null>(null);
  const [board, setBoard] = useState<any[]>([]);
  // null = closed · 'new' = create form · object = editing that branch
  const [editing, setEditing] = useState<'new' | any | null>(null);
  const load = () => { merchantApi.branches().then(setBranches); merchantApi.leaderboard().then(setBoard); };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">Branches</h1>
          <p className="text-sm text-muted">Manage locations, geo-fences and branch performance.</p>
        </div>
        <Button onClick={() => setEditing(editing ? null : 'new')}>{editing ? 'Close' : '+ Add branch'}</Button>
      </div>

      {editing && (
        <BranchForm
          key={editing === 'new' ? 'new' : editing.id}
          branch={editing === 'new' ? null : editing}
          onDone={() => { setEditing(null); load(); }}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-head font-bold text-ink">Locations</h2>
          {!branches ? <Spinner /> : branches.length === 0 ? <EmptyState title="No branches" /> : (
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-md bg-canvas p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-muted">{b.city ?? 'No city'} · geo-fence {b.geofenceM}m</p>
                    {b.lat == null && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-orange">
                        <MapPin size={11} aria-hidden /> No location set — customers can’t find you on the map
                      </p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <div className="text-right text-xs text-muted">
                      <p>{num(b._count?.stampEvents ?? 0)} stamps</p>
                      <p>{b._count?.qrCodes ?? 0} QR · {b._count?.users ?? 0} staff</p>
                    </div>
                    <button
                      onClick={() => setEditing(b)}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-hard-sm transition active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Pencil size={12} aria-hidden /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-head font-bold text-ink">Branch leaderboard <span className="text-xs font-normal text-muted">(30 days)</span></h2>
          {board.length === 0 ? <p className="text-sm text-muted">No activity yet.</p> : (
            <div className="space-y-2">
              {board.map((r, i) => (
                <div key={r.branchId} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{i + 1}</span>
                  <span className="flex-1 font-medium text-ink">{r.name}</span>
                  <span className="text-sm text-muted">{num(r.stamps)} stamps · {num(r.rewards)} rewards</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Shared create/edit form. The map picker sets lat/lng — the coordinates that
// power GPS branch detection and the store's pin on the customer Explore map.
function BranchForm({ branch, onDone }: { branch: any | null; onDone: () => void }) {
  const [f, setF] = useState({
    name: branch?.name ?? '',
    city: branch?.city ?? '',
    address: branch?.address ?? '',
    geofenceM: branch?.geofenceM ?? 250,
  });
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(
    branch?.lat != null && branch?.lng != null ? { lat: branch.lat, lng: branch.lng } : null,
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const body = { ...f, ...(loc ? { lat: loc.lat, lng: loc.lng } : {}) };
    try {
      if (branch) await merchantApi.updateBranch(branch.id, body);
      else await merchantApi.createBranch(body);
      onDone();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-head font-bold text-ink">{branch ? `Edit ${branch.name}` : 'New branch'}</h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Branch name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
          <Field label="City"><input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="e.g. Bengaluru" /></Field>
          <Field label="Address"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
          <Field label="Geo-fence (m)" hint="How close a customer must be to count as visiting">
            <input className="input" type="number" min={50} max={5000} value={f.geofenceM} onChange={(e) => setF({ ...f, geofenceM: +e.target.value })} />
          </Field>
        </div>

        <Field label="Store location" hint="Powers GPS stamp validation and your pin on the customer map.">
          <LocationPicker value={loc} radiusM={f.geofenceM} onChange={(lat, lng) => setLoc({ lat, lng })} />
        </Field>

        {err && <p className="rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}
        <Button type="submit" disabled={busy || f.name.length < 1}>
          {busy ? 'Saving…' : branch ? 'Save changes' : 'Add branch'}
        </Button>
      </form>
    </Card>
  );
}
