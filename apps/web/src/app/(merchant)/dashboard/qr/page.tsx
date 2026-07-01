'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import type { QRCode } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Field, Spinner } from '@/components/ui';

const kinds = ['store', 'shared', 'table', 'counter', 'bill', 'staff'];

export default function QrPage() {
  const [items, setItems] = useState<QRCode[] | null>(null);
  const [selected, setSelected] = useState<QRCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const load = () => merchantApi.qrCodes().then((q) => { setItems(q); if (q[0] && !selected) setSelected(q[0]); });
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">QR Codes</h1>
          <p className="text-sm text-muted">Generate branded QR codes for stores, tables and counters.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New QR'}</Button>
      </div>

      {showForm && <QrForm onDone={() => { setShowForm(false); load(); }} />}

      {!items ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="No QR codes yet" hint="Create a QR and print it for your counter." action={<Button onClick={() => setShowForm(true)}>Create QR</Button>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">Label</th><th className="px-4 py-3">Kind</th><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Scans</th></tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q.id} className={`cursor-pointer border-b border-line last:border-0 hover:bg-canvas ${selected?.id === q.id ? 'bg-brand-soft' : ''}`} onClick={() => setSelected(q)}>
                    <td className="px-4 py-3 font-medium text-ink">{q.label}</td>
                    <td className="px-4 py-3"><Badge>{q.kind}</Badge></td>
                    <td className="px-4 py-3 text-muted">{q.campaign?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{q.scanCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {selected && (
            <Card className="p-5 text-center">
              <p className="font-semibold text-ink">{selected.label}</p>
              <div className="mx-auto mt-4 w-56 rounded-lg border border-line p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/public/qr/${selected.token}.png`} alt="QR code" className="w-full" />
              </div>
              <p className="mt-3 break-all text-xs text-muted">{selected.scanUrl}</p>
              <div className="mt-4 flex justify-center gap-2">
                <a className="btn-outline" href={`/api/public/qr/${selected.token}.png`} download={`qr-${selected.label}.png`}>⬇ PNG</a>
                <a className="btn-outline" href={`/api/public/qr/${selected.token}.svg`} download={`qr-${selected.label}.svg`}>⬇ SVG</a>
                <a className="btn-ghost" href={selected.scanUrl} target="_blank">Test scan ↗</a>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function QrForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ label: '', kind: 'store', campaignId: '' });
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { merchantApi.campaigns().then((c) => setCampaigns(c.map((x) => ({ id: x.id, name: x.name })))); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await merchantApi.createQr({ label: f.label, kind: f.kind, campaignId: f.campaignId || undefined }); onDone(); }
    finally { setBusy(false); }
  }
  return (
    <Card className="p-5">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
        <Field label="Label"><input className="input" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} required placeholder="MG Road counter" /></Field>
        <Field label="Kind"><select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{kinds.map((k) => <option key={k}>{k}</option>)}</select></Field>
        <Field label="Campaign (optional)"><select className="input" value={f.campaignId} onChange={(e) => setF({ ...f, campaignId: e.target.value })}><option value="">Any active campaign</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <div className="md:col-span-3"><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Generate QR'}</Button></div>
      </form>
    </Card>
  );
}
