'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import { num } from '@/lib/format';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[] | null>(null);
  const [board, setBoard] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const load = () => { merchantApi.branches().then(setBranches); merchantApi.leaderboard().then(setBoard); };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Branches</h1>
          <p className="text-sm text-muted">Manage locations, geo-fences and branch performance.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Add branch'}</Button>
      </div>

      {showForm && <BranchForm onDone={() => { setShowForm(false); load(); }} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Locations</h2>
          {!branches ? <Spinner /> : branches.length === 0 ? <EmptyState title="No branches" /> : (
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-md bg-canvas p-3">
                  <div>
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-muted">{b.city ?? 'No city'} · geo-fence {b.geofenceM}m</p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>{num(b._count?.stampEvents ?? 0)} stamps</p>
                    <p>{b._count?.qrCodes ?? 0} QR · {b._count?.users ?? 0} staff</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Branch leaderboard <span className="text-xs font-normal text-muted">(30 days)</span></h2>
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

function BranchForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: '', city: '', address: '', geofenceM: 250 });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await merchantApi.createBranch(f); onDone(); } finally { setBusy(false); }
  }
  return (
    <Card className="p-5">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
        <Field label="Branch name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
        <Field label="City"><input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
        <Field label="Address"><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="Geo-fence (m)"><input className="input" type="number" value={f.geofenceM} onChange={(e) => setF({ ...f, geofenceM: +e.target.value })} /></Field>
        <div className="md:col-span-4"><Button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add branch'}</Button></div>
      </form>
    </Card>
  );
}
