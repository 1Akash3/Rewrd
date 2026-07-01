import { prisma } from '../../db/prisma.js';
import { distanceMeters } from '../../lib/geo.js';
import { toJson } from '../../lib/json.js';

export type FraudContext = {
  tenantId: string;
  campaign: {
    id: string;
    cooldownMinutes: number;
    perCustomerDailyLimit: number;
    geoValidation: boolean;
  };
  customerId: string;
  branch?: { id: string; lat: number | null; lng: number | null; geofenceM: number } | null;
  deviceFp?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type FraudVerdict = {
  allowed: boolean;
  reason?: string; // machine code
  message?: string; // human message
  severity?: 'low' | 'medium' | 'high';
};

// Deterministic rule stack. Returns the first blocking verdict, else allow.
export async function evaluateStamp(ctx: FraudContext): Promise<FraudVerdict> {
  const now = Date.now();

  // 1) Cooldown between stamps on the same campaign for this customer.
  if (ctx.campaign.cooldownMinutes > 0) {
    const last = await prisma.stampEvent.findFirst({
      where: { customerId: ctx.customerId, campaignId: ctx.campaign.id, status: 'granted' },
      orderBy: { createdAt: 'desc' },
    });
    if (last) {
      const mins = (now - last.createdAt.getTime()) / 60000;
      if (mins < ctx.campaign.cooldownMinutes) {
        return {
          allowed: false,
          reason: 'cooldown',
          severity: 'low',
          message: `Please wait ${Math.ceil(ctx.campaign.cooldownMinutes - mins)} more minute(s) before your next stamp.`,
        };
      }
    }
  }

  // 2) Per-customer daily limit.
  if (ctx.campaign.perCustomerDailyLimit > 0) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.stampEvent.count({
      where: {
        customerId: ctx.customerId,
        campaignId: ctx.campaign.id,
        status: 'granted',
        createdAt: { gte: dayStart },
      },
    });
    if (todayCount >= ctx.campaign.perCustomerDailyLimit) {
      return {
        allowed: false,
        reason: 'daily_limit',
        severity: 'low',
        message: "You've reached today's stamp limit for this reward.",
      };
    }
  }

  // 3) Geo-fence validation (only if the campaign requires it and we have coords).
  if (ctx.campaign.geoValidation && ctx.branch?.lat != null && ctx.branch?.lng != null) {
    if (ctx.lat == null || ctx.lng == null) {
      return {
        allowed: false,
        reason: 'geo_missing',
        severity: 'medium',
        message: 'Location is required to earn a stamp here. Please enable location and try again.',
      };
    }
    const dist = distanceMeters(ctx.lat, ctx.lng, ctx.branch.lat, ctx.branch.lng);
    if (dist > ctx.branch.geofenceM) {
      return {
        allowed: false,
        reason: 'geo_out_of_range',
        severity: 'high',
        message: 'You appear to be too far from the store to earn a stamp.',
      };
    }
  }

  // 4) Velocity check — many stamps from the same device across the tenant quickly.
  if (ctx.deviceFp) {
    const fiveMinAgo = new Date(now - 5 * 60000);
    const recent = await prisma.stampEvent.count({
      where: { deviceFp: ctx.deviceFp, createdAt: { gte: fiveMinAgo } },
    });
    if (recent >= 5) {
      return {
        allowed: false,
        reason: 'velocity',
        severity: 'high',
        message: 'Unusual activity detected on this device. Please try again later.',
      };
    }
  }

  return { allowed: true };
}

// Persist a fraud alert for merchant review + emit severity signal.
export async function raiseAlert(input: {
  tenantId: string;
  kind: string;
  severity: 'low' | 'medium' | 'high';
  detail: Record<string, unknown>;
}) {
  // Only surface medium/high blocks to merchants to avoid noise from cooldowns.
  if (input.severity === 'low') return;
  await prisma.fraudAlert.create({
    data: {
      tenantId: input.tenantId,
      kind: input.kind,
      severity: input.severity,
      detail: toJson(input.detail),
    },
  });
}
