// Single typed API client for the whole frontend. Every network call funnels
// through `request()`, which attaches the auth token and unwraps the standard
// { ok, data } / { ok:false, error } envelope. A merged frontend should reuse
// this module rather than calling fetch directly — see docs/FRONTEND-MERGE-GUIDE.md.

const TOKEN_KEYS = { merchant: 'los_merchant_token', customer: 'los_customer_token' } as const;
type Audience = keyof typeof TOKEN_KEYS;

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const tokens = {
  get(aud: Audience): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEYS[aud]);
  },
  set(aud: Audience, token: string) {
    window.localStorage.setItem(TOKEN_KEYS[aud], token);
  },
  clear(aud: Audience) {
    window.localStorage.removeItem(TOKEN_KEYS[aud]);
  },
};

async function request<T>(
  method: string,
  path: string,
  opts: { body?: unknown; audience?: Audience; raw?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const token = opts.audience ? tokens.get(opts.audience) : null;
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (opts.raw) return res as unknown as T;

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) {
    const err = json.error ?? {};
    throw new ApiError(res.status, err.code ?? 'error', err.message ?? 'Request failed', err.details);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, audience?: Audience) => request<T>('GET', path, { audience }),
  post: <T>(path: string, body?: unknown, audience?: Audience) => request<T>('POST', path, { body, audience }),
  patch: <T>(path: string, body?: unknown, audience?: Audience) => request<T>('PATCH', path, { body, audience }),
  del: <T>(path: string, audience?: Audience) => request<T>('DELETE', path, { audience }),
};

// ------------------------- typed endpoint helpers -------------------------
import type {
  Campaign, Card, CrmCustomer, MerchantUser, Overview, Plan, QRCode, RewardWalletItem, Tenant,
} from './types';

export const merchantApi = {
  signup: (b: { businessName: string; businessType: string; ownerName: string; email: string; password: string }) =>
    api.post<{ token: string; tenant: Tenant; user: MerchantUser }>('/auth/merchant/signup', b),
  login: (b: { email: string; password: string }) =>
    api.post<{ token: string; tenant: Tenant | null; user: MerchantUser }>('/auth/merchant/login', b),
  // Google Sign-In: `credential` is the ID token from Google Identity Services.
  // Existing account -> logged in; new account -> tenant auto-provisioned.
  google: (credential: string) =>
    api.post<{ token: string; tenant: Tenant | null; user: MerchantUser }>('/auth/merchant/google', { credential }),
  me: () => api.get<{ kind: string; user: MerchantUser; tenant: Tenant | null }>('/auth/me', 'merchant'),
  updateTenant: (b: { name?: string; brandColor?: string; reviewLink?: string | null; instagram?: string | null }) =>
    api.patch<Tenant>('/auth/tenant', b, 'merchant'),

  campaigns: () => api.get<Campaign[]>('/campaigns', 'merchant'),
  createCampaign: (b: Partial<Campaign>) => api.post<Campaign>('/campaigns', b, 'merchant'),
  updateCampaign: (id: string, b: Partial<Campaign>) => api.patch<Campaign>(`/campaigns/${id}`, b, 'merchant'),

  // One evergreen QR per branch — GET is self-provisioning, nothing to create.
  qrCodes: () => api.get<QRCode[]>('/qr', 'merchant'),

  pendingApprovals: () => api.get<any[]>('/stamps/pending', 'merchant'),
  approveStamp: (eventId: string) => api.post<any>(`/stamps/${eventId}/approve`, {}, 'merchant'),

  // All analytics endpoints accept an optional branchId for per-branch drill-down.
  overview: (branchId?: string) => api.get<Overview>(`/analytics/overview${branchId ? `?branchId=${branchId}` : ''}`, 'merchant'),
  trend: (branchId?: string) => api.get<{ date: string; scans: number }[]>(`/analytics/trend${branchId ? `?branchId=${branchId}` : ''}`, 'merchant'),
  breakdown: (branchId?: string) => api.get<{ newUsers: number; returning: number; popularHours: { hour: number; count: number }[] }>(`/analytics/breakdown${branchId ? `?branchId=${branchId}` : ''}`, 'merchant'),
  topCampaigns: (branchId?: string) => api.get<{ id: string; name: string; stamps: number; rewards: number; customers: number }[]>(`/analytics/campaigns${branchId ? `?branchId=${branchId}` : ''}`, 'merchant'),

  customers: (segment?: string) => api.get<CrmCustomer[]>(`/crm/customers${segment ? `?segment=${segment}` : ''}`, 'merchant'),
  segments: () => api.get<{ total: number; counts: Record<string, number> }>('/crm/segments', 'merchant'),
  remindCustomer: (customerId: string) => api.post<any>(`/crm/customers/${customerId}/remind`, {}, 'merchant'),

  rewards: (status?: string) => api.get<any[]>(`/rewards${status ? `?status=${status}` : ''}`, 'merchant'),
  lookupReward: (token: string) => api.get<any>(`/rewards/lookup/${token}`, 'merchant'),
  claimReward: (token: string, notes?: string) => api.post<any>(`/rewards/${token}/claim`, { notes }, 'merchant'),

  branches: () => api.get<any[]>('/branches', 'merchant'),
  createBranch: (b: any) => api.post<any>('/branches', b, 'merchant'),
  updateBranch: (id: string, b: any) => api.patch<any>(`/branches/${id}`, b, 'merchant'),
  leaderboard: () => api.get<any[]>('/branches/leaderboard', 'merchant'),

  staff: () => api.get<any[]>('/staff', 'merchant'),
  createStaff: (b: any) => api.post<any>('/staff', b, 'merchant'),

  fraudAlerts: (status?: string) => api.get<any[]>(`/fraud/alerts${status ? `?status=${status}` : ''}`, 'merchant'),
  auditLog: () => api.get<any[]>('/fraud/audit', 'merchant'),

  plans: () => api.get<Plan[]>('/billing/plans'),
  subscription: () => api.get<any>('/billing/subscription', 'merchant'),
  subscribe: (planCode: string, couponCode?: string) => api.post<any>('/billing/subscribe', { planCode, couponCode }, 'merchant'),
  invoices: () => api.get<any[]>('/billing/invoices', 'merchant'),

  growthSummary: () => api.get<any>('/growth/merchant/summary', 'merchant'),
};

export const customerApi = {
  // Customer auth is email-OTP (free — no SMS gateway needed). Phone is optional profile data.
  requestOtp: (email: string) => api.post<{ sent: boolean; devCode?: string }>('/auth/customer/otp/request', { email }),
  verifyOtp: (email: string, code: string, name?: string, phone?: string) =>
    api.post<{ token: string; customer: { id: string; email: string; phone: string | null; name: string | null } }>('/auth/customer/otp/verify', { email, code, name, phone }),

  nearbyOffers: (lat?: number, lng?: number) =>
    api.get<NearbyOffer[]>(lat != null && lng != null ? `/public/offers/nearby?lat=${lat}&lng=${lng}` : '/public/offers/nearby'),

  resolveQr: (token: string) => api.get<any>(`/public/resolve/${token}`),
  earn: (b: { token: string; campaignId: string; deviceFp?: string; lat?: number; lng?: number }) =>
    api.post<any>('/stamps/earn', b, 'customer'),

  cards: () => api.get<Card[]>('/me/cards', 'customer'),
  wallet: () => api.get<RewardWalletItem[]>('/me/rewards', 'customer'),
  history: () => api.get<any[]>('/me/history', 'customer'),
  updateProfile: (b: any) => api.patch<any>('/me/profile', b, 'customer'),
};

export type NearbyOffer = {
  tenantId: string;
  name: string;
  slug: string;
  brandColor: string | null;
  campaign: { id: string; name: string; rewardTitle: string; stampsRequired: number };
  branch: { name: string; city: string | null; lat: number | null; lng: number | null } | null;
  distanceMeters: number | null;
};
