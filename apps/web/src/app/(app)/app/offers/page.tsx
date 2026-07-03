'use client';
import { useEffect, useState } from 'react';
import { ChevronRight, LocateFixed, MapPin } from 'lucide-react';
import { customerApi, type NearbyOffer } from '@/lib/api';
import { getGeo } from '@/lib/device';
import { EmptyState, Mascot, SkeletonList, stampIcon } from '@/components/ui';
import { OffersMap } from '@/components/OffersMap';

function distLabel(m: number | null): string | null {
  if (m == null) return null;
  if (m < 1000) return `${m} m away`;
  return `${(m / 1000).toFixed(1)} km away`;
}

// Live "offers near you": asks for location (graceful if denied — falls back
// to the newest offers platform-wide) and lists every active campaign.
export default function OffersPage() {
  const [offers, setOffers] = useState<NearbyOffer[] | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [located, setLocated] = useState<boolean | null>(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    const g = await getGeo();
    setGeo(g);
    setLocated(!!g);
    try {
      setOffers(await customerApi.nearbyOffers(g?.lat, g?.lng));
    } catch (e: any) {
      setErr(e.message); setOffers([]);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 font-head text-[28px] font-bold tracking-[-0.02em] text-ink">Offers near you</h1>
      <p className="mb-4 text-sm text-muted">Ongoing loyalty offers at participating businesses.</p>

      {located === false && (
        <button onClick={load} className="mb-4 flex w-full items-center gap-2.5 rounded-2xl border-[1.5px] border-line bg-brand-soft px-4 py-3 text-left text-[13px] text-ink">
          <LocateFixed size={16} className="flex-shrink-0 text-brand" aria-hidden />
          <span>Showing the latest offers everywhere. <span className="font-semibold text-brand">Allow location</span> to see the map and sort by distance.</span>
        </button>
      )}

      {/* Live map (free OpenStreetMap) — only when we know where the customer is. */}
      {geo && offers && offers.length > 0 && (
        <OffersMap key={`${geo.lat},${geo.lng},${offers.length}`} center={geo} offers={offers} />
      )}

      {!offers ? <SkeletonList count={4} /> : err ? (
        <EmptyState title="Couldn’t load offers" hint={err} action={<button className="btn-outline" onClick={load}>Try again</button>} />
      ) : offers.length === 0 ? (
        <div className="card p-7 text-center">
          <Mascot size={96} color="#F06706" className="mx-auto" />
          <p className="mt-4 font-head text-xl font-bold text-ink">Nothing nearby yet</p>
          <p className="mx-auto mt-1.5 max-w-[260px] text-sm text-muted">No active offers in your area right now. Scan a store’s QR when you visit to join its program.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => {
            const color = o.brandColor ?? 'rgb(var(--brand))';
            const dist = distLabel(o.distanceMeters);
            return (
              <div key={o.campaign.id} className="card-data flex items-center gap-3.5 p-3.5">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[13px] border-2 border-ink text-white shadow-hard-sm" style={{ background: color }}>
                  {stampIcon(o.name, 22)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-head text-[15px] font-bold text-ink">{o.name}</p>
                  <p className="truncate text-[13px] text-muted">{o.campaign.rewardTitle} · {o.campaign.stampsRequired} stamps</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand">
                    <MapPin size={11} aria-hidden />
                    {[o.branch?.name, o.branch?.city, dist].filter(Boolean).join(' · ') || 'Participating store'}
                  </p>
                </div>
                <ChevronRight size={18} className="flex-shrink-0 text-line" aria-hidden />
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-muted">Scan a store’s QR at the counter to start collecting stamps.</p>
    </div>
  );
}
