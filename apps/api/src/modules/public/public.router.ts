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

// Reverse-geocode coords to an address (Google Maps; null if key not set).
publicRouter.get(
  '/geocode',
  asyncHandler(async (req, res) => {
    const q = validate(z.object({ lat: z.coerce.number(), lng: z.coerce.number() }), req.query);
    ok(res, { address: await reverseGeocode(q.lat, q.lng) });
  }),
);
