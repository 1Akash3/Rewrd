// Shared domain types mirroring the API responses. A second/merged frontend can
// import these directly to stay type-compatible with the backend contract.

export type Role = 'superadmin' | 'owner' | 'branch_manager' | 'staff' | 'support' | 'sales';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  brandColor?: string;
  logoUrl?: string | null;
  status?: string;
}

export interface MerchantUser {
  id: string;
  name: string;
  role: Role;
  email?: string | null;
  branchId?: string | null;
}

export interface CustomerUser {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  stampsRequired: number;
  rewardTitle: string;
  rewardDetail?: string | null;
  cooldownMinutes: number;
  perCustomerDailyLimit: number;
  requireStaffApproval: boolean;
  geoValidation: boolean;
  _count?: { cards: number; stampEvents: number; redemptions: number };
}

export interface QRCode {
  id: string;
  token: string;
  label: string;
  kind: string;
  status: string;
  scanCount: number;
  scanUrl?: string;
  campaign?: { id: string; name: string } | null;
  branch?: { id: string; name: string } | null;
}

export interface Card {
  id: string;
  stamps: number;
  stampsRequired: number;
  cyclesDone: number;
  lastStampAt: string | null;
  campaign: { id: string; name: string; rewardTitle: string; type: string };
  brand: Tenant;
}

export interface RewardWalletItem {
  id: string;
  token: string;
  status: 'unlocked' | 'claimed' | 'expired' | 'void';
  rewardTitle: string;
  expiresAt: string | null;
  claimedAt: string | null;
  brand: string;
  brandColor?: string;
  campaign: string;
}

export interface Overview {
  scansToday: number;
  scansWeek: number;
  scansMonth: number;
  activeCustomers: number;
  repeatCustomers: number;
  totalCustomers: number;
  rewardsUnlocked: number;
  rewardsClaimed: number;
  completions: number;
  redemptionRate: number;
  avgVisitsPerCustomer: number;
  openFraudAlerts: number;
}

export interface CrmCustomer {
  id: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  visits: number;
  cards: number;
  tag: string;
  lastVisit: string | null;
  consent: boolean;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  priceYearly: number;
  maxBranches: number;
  maxCampaigns: number;
  features: Record<string, unknown>;
}
