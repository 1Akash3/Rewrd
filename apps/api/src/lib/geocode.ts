import { env } from '../config/env.js';

// Reverse-geocode lat/lng to a human-readable address via Google Maps.
// Returns null when no key is configured (branch detection still works via
// haversine nearest-branch, which needs no key).
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!env.googleMapsApiKey) return null;
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('key', env.googleMapsApiKey);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: { formatted_address?: string }[] };
    return data.results?.[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}
