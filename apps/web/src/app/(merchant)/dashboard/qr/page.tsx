'use client';
import { useEffect, useState } from 'react';
import { Download, ExternalLink, MapPin } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import type { QRCode } from '@/lib/types';
import { Card, EmptyState, SkeletonList } from '@/components/ui';
import { num } from '@/lib/format';

// One evergreen QR per branch. The API self-provisions them, so this page is
// pure display: print the QR, put it at the counter, done. The QR never
// changes when campaigns change — scanning always shows the live offers.
export default function QrPage() {
  const [items, setItems] = useState<(QRCode & { branch?: any; scanUrl?: string })[] | null>(null);
  useEffect(() => { merchantApi.qrCodes().then(setItems); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ink">Your store QRs</h1>
        <p className="text-sm text-muted">
          One QR per branch — print it once and it always shows your live offers. No reprinting when campaigns change.
        </p>
      </div>

      {!items ? <SkeletonList count={2} /> : items.length === 0 ? (
        <EmptyState title="No branches yet" hint="Add a branch and its QR is created automatically." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((q) => (
            <Card key={q.id} className="p-5 text-center">
              <p className="flex items-center justify-center gap-1.5 font-head text-lg font-bold text-ink">
                <MapPin size={16} className="text-brand" aria-hidden /> {q.branch?.name ?? q.label}
              </p>
              {q.branch?.city && <p className="text-xs text-muted">{q.branch.city}</p>}
              <div className="mx-auto mt-4 w-52 rounded-2xl border-2 border-ink bg-white p-3 shadow-hard-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/public/qr/${q.token}.png`} alt={`QR for ${q.branch?.name ?? 'branch'}`} className="w-full" />
              </div>
              <p className="mt-3 text-xs text-muted">{num(q.scanCount ?? 0)} scans so far</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <a className="btn-outline !py-2 text-xs" href={`/api/public/qr/${q.token}.png`} download={`rewrd-qr-${(q.branch?.name ?? 'branch').toLowerCase().replace(/\s+/g, '-')}.png`}>
                  <Download size={14} aria-hidden /> PNG
                </a>
                <a className="btn-outline !py-2 text-xs" href={`/api/public/qr/${q.token}.svg`} download={`rewrd-qr-${(q.branch?.name ?? 'branch').toLowerCase().replace(/\s+/g, '-')}.svg`}>
                  <Download size={14} aria-hidden /> SVG
                </a>
                {q.scanUrl && (
                  <a className="btn-ghost !py-2 text-xs" href={q.scanUrl} target="_blank" rel="noreferrer">
                    Test scan <ExternalLink size={13} aria-hidden />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-head font-bold text-ink">Printing tips</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>· Download the SVG for sharp prints at any size (posters, table tents, stickers).</li>
          <li>· Place it where customers pay — the counter works best.</li>
          <li>· The code is permanent: pausing or launching campaigns never breaks it.</li>
        </ul>
      </Card>
    </div>
  );
}
