// Lightweight, privacy-respecting device fingerprint used for fraud velocity
// checks. This is a stable-per-browser random id (not cross-site tracking).
export function deviceFp(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'los_device_fp';
  let fp = window.localStorage.getItem(key);
  if (!fp) {
    fp = 'fp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.localStorage.setItem(key, fp);
  }
  return fp;
}

// Best-effort geolocation for geo-fenced campaigns (resolves null if denied).
export function getGeo(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 4000, maximumAge: 60000 },
    );
  });
}
