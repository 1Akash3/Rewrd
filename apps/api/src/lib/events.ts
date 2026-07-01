import { prisma } from '../db/prisma.js';
import { toJson } from './json.js';

// Emit an analytics event (feeds dashboards + the analytics taxonomy in docs).
export async function track(name: string, data: {
  tenantId?: string | null;
  branchId?: string | null;
  campaignId?: string | null;
  customerId?: string | null;
  props?: Record<string, unknown>;
}) {
  await prisma.analyticsEvent.create({
    data: {
      name,
      tenantId: data.tenantId ?? null,
      branchId: data.branchId ?? null,
      campaignId: data.campaignId ?? null,
      customerId: data.customerId ?? null,
      props: data.props ? toJson(data.props) : null,
    },
  });
}

// Append an immutable audit-log entry.
export async function audit(input: {
  tenantId?: string | null;
  actorId?: string | null;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      tenantId: input.tenantId ?? null,
      actorId: input.actorId ?? null,
      action: input.action,
      target: input.target,
      meta: input.meta ? toJson(input.meta) : null,
    },
  });
}
