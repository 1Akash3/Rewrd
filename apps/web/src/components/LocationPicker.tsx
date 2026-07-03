'use client';
import { useEffect, useRef, useState } from 'react';
import type { Circle, Map as LeafletMap, Marker } from 'leaflet';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getGeo } from '@/lib/device';

// Click-to-set branch location picker — Leaflet + OpenStreetMap (free, no
// key). Tap the map (or drag the pin) to set coordinates; the translucent
// circle previews the geo-fence radius so owners see exactly which area
// counts as "at the store" for GPS stamp validation.
const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

export function LocationPicker({ value, radiusM = 250, onChange }: {
  value: { lat: number; lng: number } | null;
  radiusM?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [locating, setLocating] = useState(false);

  // Place (or move) the pin + geofence circle. Defined against refs so both
  // the init effect and the prop-sync effect can share it.
  async function setPin(lat: number, lng: number, pan = true) {
    const L = (await import('leaflet')).default;
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          className: '',
          html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#7C44BD;border:2px solid #fff;box-shadow:0 3px 7px rgba(0,0,0,0.28)"></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        }),
      }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        onChangeRef.current(+p.lat.toFixed(6), +p.lng.toFixed(6));
      });
      markerRef.current = marker;
      circleRef.current = L.circle([lat, lng], {
        radius: radiusM, color: '#7C44BD', weight: 2, dashArray: '6 8',
        fillColor: '#7C44BD', fillOpacity: 0.08,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current?.setLatLng([lat, lng]);
    }
    if (pan) map.setView([lat, lng], Math.max(map.getZoom(), 16));
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !boxRef.current || mapRef.current) return;
      const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true });
      mapRef.current = map;
      map.setView(value ? [value.lat, value.lng] : INDIA_CENTER, value ? 16 : 5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onChangeRef.current(+lat.toFixed(6), +lng.toFixed(6));
      });
      if (value) await setPin(value.lat, value.lng, false);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep pin + circle in sync when the value/radius change from outside.
  useEffect(() => { if (value) setPin(value.lat, value.lng); }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { circleRef.current?.setRadius(radiusM); }, [radiusM]);

  async function locateMe() {
    setLocating(true);
    const geo = await getGeo();
    setLocating(false);
    if (geo) onChangeRef.current(+geo.lat.toFixed(6), +geo.lng.toFixed(6));
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink shadow-hard-sm">
        <div ref={boxRef} className="h-[300px] w-full bg-[#E4EBE2]" />
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-hard-sm"
        >
          <LocateFixed size={13} aria-hidden /> {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {value
          ? <>Pinned at <span className="font-mono font-semibold text-ink">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</span> — tap the map or drag the pin to adjust. The dashed circle is your geo-fence.</>
          : 'Tap the map to drop a pin on your store (or use your location). This powers GPS branch detection and your pin on the customer map.'}
      </p>
    </div>
  );
}
