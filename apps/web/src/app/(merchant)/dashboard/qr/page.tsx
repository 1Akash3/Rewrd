'use client';
import { useEffect, useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import type { QRCode } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Field, Spinner } from '@/components/ui';
import { useMerchant } from '@/lib/useMerchant';

const kinds = ['store', 'shared', 'table', 'counter', 'bill', 'staff'];

async function getQrBase64(token: string): Promise<string> {
  const res = await fetch(`/api/public/qr/${token}.png`);
  if (!res.ok) throw new Error('Failed to load QR code');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadPoster(format: 'svg' | 'png', selected: QRCode, tenant: any) {
  const tenantName = tenant?.name ?? 'Our Store';
  const branchName = selected.branch?.name ?? 'Main Branch';
  const brandColor = tenant?.brandColor ?? '#4f46e5';
  const label = selected.label ?? 'Counter QR';
  const scanUrl = selected.scanUrl;

  try {
    const qrDataUrl = await getQrBase64(selected.token);

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800&amp;family=Plus+Jakarta+Sans:wght@500;700&amp;display=swap');
      .title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 26px; fill: #111827; text-anchor: middle; }
      .subtitle { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13px; fill: #4B5563; text-anchor: middle; }
      .desc { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13px; fill: #111827; text-anchor: middle; }
      .store-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 20px; fill: #FFFFFF; text-anchor: middle; }
      .branch-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; font-size: 12px; fill: rgba(255, 255, 255, 0.85); text-anchor: middle; }
      .footer-text { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; font-size: 10px; fill: #9CA3AF; text-anchor: middle; }
    </style>
    <filter id="hard-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="6" dy="6" stdDeviation="0" flood-color="#111827" flood-opacity="1" />
    </filter>
  </defs>
  
  <!-- Outer Card Frame -->
  <rect x="15" y="15" width="370" height="530" rx="28" fill="#FFFDF9" stroke="#111827" stroke-width="4" filter="url(#hard-shadow)" />
  
  <!-- Brand Header Banner -->
  <path d="M 17 43 C 17 28.5, 28.5 17, 43 17 L 357 17 C 371.5 17, 383 28.5, 383 43 L 383 95 L 17 95 Z" fill="${brandColor}" stroke="#111827" stroke-width="2" />
  
  <text x="200" y="55" class="store-name">${tenantName.replace(/&/g, '&amp;')}</text>
  <text x="200" y="76" class="branch-name">${branchName.replace(/&/g, '&amp;')}</text>
  
  <!-- Content Titles -->
  <text x="200" y="145" class="title">SCAN FOR OFFERS</text>
  <text x="200" y="170" class="subtitle">Join our loyalty club &amp; earn stamps!</text>
  
  <!-- QR Outer Wrapper -->
  <rect x="75" y="200" width="250" height="250" rx="20" fill="#FFFFFF" stroke="#111827" stroke-width="3" />
  
  <!-- Embed base64 QR Image -->
  <image href="${qrDataUrl}" x="90" y="215" width="220" height="220" />
  
  <!-- Action Instructions -->
  <text x="200" y="482" class="desc">Scan QR · Select Offer · Collect Stamp</text>
  <text x="200" y="502" class="footer-text" fill="#6B7280">${scanUrl}</text>
  <text x="200" y="525" class="footer-text">Powered by Rewrd</text>
</svg>`;

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${label}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800; // 2x scale for sharp printing
        canvas.height = 1120;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 800, 1120);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `qr-${label}.png`;
        a.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  } catch (err: any) {
    alert('Failed to generate printable QR card: ' + err.message);
  }
}

export default function QrPage() {
  const { tenant } = useMerchant();
  const [items, setItems] = useState<QRCode[] | null>(null);
  const [selected, setSelected] = useState<QRCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const load = () => merchantApi.qrCodes().then((q) => { setItems(q); if (q[0] && !selected) setSelected(q[0]); });
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleSelect = (q: QRCode) => {
    setSelected(q);
    setTimeout(() => {
      const el = document.getElementById('qr-details');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">QR Codes</h1>
          <p className="text-sm text-muted">One QR per store is all you need — scanning it shows every live offer automatically.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New QR'}</Button>
      </div>

      {showForm && <QrForm onDone={() => { setShowForm(false); load(); }} />}

      {!items ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="No QR codes yet" hint="Create a QR and print it for your counter." action={<Button onClick={() => setShowForm(true)}>Create QR</Button>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                  <tr><th className="px-4 py-3">Label</th><th className="px-4 py-3">Kind</th><th className="px-4 py-3">Offers shown</th><th className="px-4 py-3">Scans</th></tr>
                </thead>
                <tbody>
                  {items.map((q) => (
                    <tr key={q.id} className={`cursor-pointer border-b border-line last:border-0 hover:bg-canvas ${selected?.id === q.id ? 'bg-brand-soft' : ''}`} onClick={() => handleSelect(q)}>
                      <td className="px-4 py-3 font-medium text-ink">{q.label}</td>
                      <td className="px-4 py-3"><Badge>{q.kind}</Badge></td>
                      <td className="px-4 py-3 text-muted">{q.campaign?.name ?? 'All live offers'}</td>
                      <td className="px-4 py-3 text-muted">{q.scanCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {selected && (
            <div id="qr-details">
              <Card className="p-5 text-center bg-canvas relative overflow-hidden">
                <p className="font-semibold text-ink text-sm mb-4">Printable Counter Display Preview</p>
                
                {/* Flyer Mockup */}
                <div 
                  className="mx-auto w-[280px] rounded-3xl border-2 border-ink bg-[#FFFDF9] shadow-hard-md overflow-hidden text-center flex flex-col mb-4"
                >
                  {/* Header Band */}
                  <div 
                    className="px-4 py-4 border-b-2 border-ink text-white flex flex-col items-center"
                    style={{ backgroundColor: tenant?.brandColor ?? '#4f46e5' }}
                  >
                    <p className="font-head text-base font-bold truncate max-w-full leading-tight">{tenant?.name ?? 'Our Store'}</p>
                    <p className="text-[10px] opacity-90 truncate max-w-full mt-0.5">{selected.branch?.name ?? 'Main Branch'}</p>
                  </div>
                  
                  {/* Titles */}
                  <div className="px-3 pt-5 pb-3">
                    <p className="font-head text-lg font-extrabold text-ink leading-tight">SCAN FOR OFFERS</p>
                    <p className="text-xs text-muted font-medium mt-1">Join our loyalty club &amp; earn stamps!</p>
                  </div>
                  
                  {/* QR Box */}
                  <div className="mx-auto w-40 h-40 rounded-xl border border-line bg-white p-2.5 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/public/qr/${selected.token}.png`} alt="QR code" className="w-full h-full" />
                  </div>
                  
                  {/* Footer Instructions */}
                  <div className="px-3 pt-4 pb-5 flex flex-col items-center">
                    <p className="text-xs font-bold text-ink leading-tight">Scan QR · Select Offer · Collect Stamp</p>
                    <p className="text-[9px] text-muted truncate max-w-full mt-1.5 break-all">{selected.scanUrl}</p>
                    <p className="text-[9px] text-muted/60 mt-2 font-medium">Powered by Rewrd</p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button 
                    className="btn-brand flex items-center gap-1.5 text-xs !py-2 !px-3 animate-pulse-subtle"
                    onClick={() => downloadPoster('png', selected, tenant)}
                  >
                    <Download size={13} aria-hidden /> Download PNG
                  </button>
                  <button 
                    className="btn-outline flex items-center gap-1.5 text-xs !py-2 !px-3"
                    onClick={() => downloadPoster('svg', selected, tenant)}
                  >
                    <Download size={13} aria-hidden /> Download SVG
                  </button>
                  <a className="btn-ghost flex items-center gap-1 text-xs !py-2 !px-3" href={selected.scanUrl} target="_blank" rel="noreferrer">
                    Test scan <ExternalLink size={12} aria-hidden />
                  </a>
                </div>
              </Card>
            </div>
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

