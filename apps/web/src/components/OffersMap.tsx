'use client';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NearbyOffer } from '@/lib/api';

// Explore map — Leaflet + OpenStreetMap tiles (completely free, no API key).
// Recreates the mockup's look: ink-bordered rounded panel, dashed search-radius
// ring, brand-colored teardrop pins, and a blue "you are here" halo dot.
export function OffersMap({ center, offers, radiusM = 5000 }:
  { center: { lat: number; lng: number }; offers: NearbyOffer[]; radiusM?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Leaflet touches `window` at import time — load it client-side only.
      const L = (await import('leaflet')).default;
      if (cancelled || !boxRef.current || mapRef.current) return;

      const map = L.map(boxRef.current, { zoomControl: false, attributionControl: true });
      mapRef.current = map;
      map.setView([center.lat, center.lng], 14);
      // Leaflet measures its container at init; on mobile (and inside anything
      // still laying out) that measurement is stale and tiles render gray or
      // misaligned. Re-measure after layout settles + whenever the box resizes.
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 600);
      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(boxRef.current);
      map.on('unload', () => ro.disconnect());
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dashed search-radius ring (mockup's "offers within X km" circle).
      L.circle([center.lat, center.lng], {
        radius: radiusM,
        color: '#7C44BD',
        weight: 2,
        dashArray: '6 8',
        fillColor: '#7C44BD',
        fillOpacity: 0.07,
      }).addTo(map);

      // "You are here" — blue dot with a soft halo.
      L.marker([center.lat, center.lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:20px;height:20px;border-radius:50%;background:#2A6FDB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(42,111,219,0.2)"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
        interactive: false,
      }).addTo(map);

      // One teardrop pin per offer branch, in the store's brand color.
      const bounds: [number, number][] = [[center.lat, center.lng]];
      for (const o of offers) {
        if (o.branch?.lat == null || o.branch?.lng == null) continue;
        bounds.push([o.branch.lat, o.branch.lng]);
        const color = o.brandColor ?? '#7C44BD';
        const initial = (o.name[0] ?? '?').toUpperCase();
        const pin = L.marker([o.branch.lat, o.branch.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 3px 7px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center">
                     <span style="transform:rotate(45deg);color:#fff;font-weight:700;font-size:14px;font-family:system-ui">${initial}</span>
                   </div>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          }),
        }).addTo(map);
        pin.bindPopup(
          `<strong style="font-size:14px">${o.name}</strong><br/>` +
          `<span style="font-size:12px">${o.campaign.rewardTitle} · ${o.campaign.stampsRequired} stamps</span><br/>` +
          `<span style="font-size:11px;color:#6a655d">${o.branch.name}${o.branch.city ? ' · ' + o.branch.city : ''}</span>`,
        );
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The map is initialized once per mount; offers/center changes remount via key upstream.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mb-4 overflow-hidden rounded-[22px] border-2 border-ink shadow-hard-sm">
      <div ref={boxRef} className="h-[290px] w-full bg-[#E4EBE2]" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white">
        Showing offers within {Math.round(radiusM / 1000)} km
      </div>
    </div>
  );
}
