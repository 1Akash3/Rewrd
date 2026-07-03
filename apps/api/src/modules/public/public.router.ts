import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { asyncHandler, ok, validate } from '../../lib/http.js';
import { distanceMeters } from '../../lib/geo.js';
import { reverseGeocode } from '../../lib/geocode.js';

// Public, unauthenticated helpers for the customer scan flow (GPS branch detect).
export const publicRouter = Router();

// Given a tenant + coords, pick the nearest branch (haversine — no API key needed).
// Powers "one QR across branches with GPS branch detection".
publicRouter.get(
  '/nearest-branch',
  asyncHandler(async (req, res) => {
    const q = validate(
      z.object({ tenantId: z.string(), lat: z.coerce.number(), lng: z.coerce.number() }),
      req.query,
    );
    const branches = await prisma.branch.findMany({ where: { tenantId: q.tenantId, status: 'active' } });
    const withCoords = branches.filter((b) => b.lat != null && b.lng != null);
    if (!withCoords.length) return ok(res, { branch: null });
    let best = withCoords[0];
    let bestDist = Infinity;
    for (const b of withCoords) {
      const d = distanceMeters(q.lat, q.lng, b.lat!, b.lng!);
      if (d < bestDist) { bestDist = d; best = b; }
    }
    ok(res, { branch: { id: best.id, name: best.name, city: best.city }, distanceMeters: Math.round(bestDist), withinGeofence: bestDist <= best.geofenceM });
  }),
);

// Nearby ongoing offers — powers the customer "Offers near you" screen.
// With coords: active-tenant campaigns sorted by distance to their nearest
// branch (haversine, no API key). Without coords: newest campaigns platform-wide,
// so the screen still works when location permission is denied.
publicRouter.get(
  '/offers/nearby',
  asyncHandler(async (req, res) => {
    const q = validate(
      z.object({ lat: z.coerce.number().optional(), lng: z.coerce.number().optional(), radiusM: z.coerce.number().default(5000) }),
      req.query,
    );
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'active', tenant: { status: { in: ['active', 'trial'] } } },
      include: { tenant: { select: { id: true, name: true, slug: true, brandColor: true, branches: { where: { status: 'active' } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const hasGeo = q.lat != null && q.lng != null;
    const offers = campaigns.map((c) => {
      // Nearest branch with coords (when we have the customer's location);
      // otherwise fall back to the first active branch for display. Branch
      // coords ride along so the Explore map can drop pins.
      let branch: { name: string; city: string | null; lat: number | null; lng: number | null } | null = null;
      let dist: number | null = null;
      if (hasGeo) {
        for (const b of c.tenant.branches) {
          if (b.lat == null || b.lng == null) continue;
          const d = distanceMeters(q.lat!, q.lng!, b.lat, b.lng);
          if (dist === null || d < dist) { dist = Math.round(d); branch = { name: b.name, city: b.city, lat: b.lat, lng: b.lng }; }
        }
      }
      if (!branch && c.tenant.branches[0]) {
        const b = c.tenant.branches[0];
        branch = { name: b.name, city: b.city, lat: b.lat ?? null, lng: b.lng ?? null };
      }
      return {
        tenantId: c.tenant.id,
        name: c.tenant.name,
        slug: c.tenant.slug,
        brandColor: c.tenant.brandColor,
        campaign: { id: c.id, name: c.name, rewardTitle: c.rewardTitle, stampsRequired: c.stampsRequired },
        branch,
        distanceMeters: dist,
      };
    });

    // Sort by distance when we have it; keep only in-radius offers (plus
    // distance-less ones so sparse data still shows something).
    const radiusM = q.radiusM ?? 5000;
    const sorted = hasGeo
      ? offers
          .filter((o) => o.distanceMeters === null || o.distanceMeters <= radiusM)
          .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity))
      : offers;
    ok(res, sorted.slice(0, 20));
  }),
);

// Reverse-geocode coords to an address (Google Maps; null if key not set).
publicRouter.get(
  '/geocode',
  asyncHandler(async (req, res) => {
    const q = validate(z.object({ lat: z.coerce.number(), lng: z.coerce.number() }), req.query);
    ok(res, { address: await reverseGeocode(q.lat, q.lng) });
  }),
);
