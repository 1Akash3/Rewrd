// Seed script — plans + a demo tenant with campaigns, branches, staff, a QR,
// and a demo customer with an in-progress stamp card. Idempotent-ish: it clears
// demo data first so `npm run seed` can be re-run safely.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const toJson = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log('Seeding subscription plans...');
  // Prices in paise (₹1 = 100 paise). Annual billing. 30-day free trial, no card.
  const plans = [
    { code: 'basic', name: 'Basic', priceYearly: 99900, maxBranches: 1, maxCampaigns: 5, features: { stampCards: true, aiMenu: true, scratchCards: true, unlimitedScans: true, analytics: 'standard', freeQrStand: true, gpsBranch: false, whiteLabel: false, api: false } },
    { code: 'growth', name: 'Growth', priceYearly: 249900, maxBranches: 3, maxCampaigns: 25, features: { stampCards: true, aiMenu: true, scratchCards: true, unlimitedScans: true, analytics: 'branch', freeQrStand: true, sharedQr: true, gpsBranch: true, prioritySupport: true, whiteLabel: false, api: false } },
    { code: 'pro', name: 'Pro', priceYearly: 499900, maxBranches: 6, maxCampaigns: 100, features: { stampCards: true, aiMenu: true, scratchCards: true, unlimitedScans: true, analytics: 'advanced', freeQrStand: true, sharedQr: true, gpsBranch: true, accountManager: true, whiteLabel: true, api: true } },
    { code: 'enterprise', name: 'Enterprise', priceYearly: 0, maxBranches: -1, maxCampaigns: 1000, features: { stampCards: true, aiMenu: true, scratchCards: true, unlimitedScans: true, analytics: 'advanced', freeQrStand: true, sharedQr: true, gpsBranch: true, accountManager: true, whiteLabel: true, api: true, sso: true, custom: true } },
  ];
  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({ where: { code: p.code }, update: { ...p, features: toJson(p.features) }, create: { ...p, features: toJson(p.features) } });
  }

  // Platform super admin — the ONLY operator login. Credentials come from
  // ADMIN_EMAIL / ADMIN_PASSWORD env vars so the owner can set their own
  // private values; the defaults are for local dev only.
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@rewrd.dev';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPassword, 10) },
    create: { role: 'superadmin', name: 'Platform Admin', email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10) },
  });

  // Clear + recreate demo tenant.
  const existing = await prisma.tenant.findUnique({ where: { slug: 'brew-and-bean' } });
  if (existing) await prisma.tenant.delete({ where: { id: existing.id } });

  console.log('Seeding demo tenant "Brew & Bean"...');
  const basic = await prisma.subscriptionPlan.findUnique({ where: { code: 'growth' } });
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Brew & Bean', slug: 'brew-and-bean', businessType: 'cafe', brandColor: '#b45309', status: 'active', kycStatus: 'verified',
      users: {
        create: [
          { role: 'owner', name: 'Asha Owner', email: 'owner@brewbean.dev', passwordHash: await bcrypt.hash('owner1234', 10) },
          { role: 'staff', name: 'Ravi Cashier', email: 'staff@brewbean.dev', passwordHash: await bcrypt.hash('staff1234', 10) },
        ],
      },
      branches: {
        create: [
          { name: 'MG Road', city: 'Bengaluru', lat: 12.9758, lng: 77.6096, geofenceM: 250 },
          { name: 'Koramangala', city: 'Bengaluru', lat: 12.9352, lng: 77.6245, geofenceM: 250 },
        ],
      },
      subscription: basic ? { create: { planId: basic.id, status: 'active', renewsAt: new Date(Date.now() + 365 * 864e5) } } : undefined,
    },
    include: { branches: true, users: true },
  });

  const campaign = await prisma.campaign.create({
    data: {
      tenantId: tenant.id, name: 'Buy 8 get 1 free coffee', type: 'visit', status: 'active',
      stampsRequired: 8, rewardTitle: 'Free coffee', rewardDetail: 'Any regular coffee on the house', cooldownMinutes: 30, perCustomerDailyLimit: 2,
    },
  });
  // ONE QR per store: intentionally NOT bound to a campaign, so scanning it
  // lists every live offer and the customer picks which coupon to add.
  const qr = await prisma.qRCode.create({ data: { tenantId: tenant.id, branchId: tenant.branches[0].id, label: 'Store QR — all offers', kind: 'store' } });

  // Demo customer with progress.
  const customer = await prisma.customer.upsert({
    where: { email: 'neha@example.com' }, update: { name: 'Neha Customer' },
    create: { email: 'neha@example.com', phone: '+919999900001', name: 'Neha Customer', consentAt: new Date() },
  });
  const card = await prisma.stampCard.create({ data: { customerId: customer.id, campaignId: campaign.id, stamps: 5, lastStampAt: new Date() } });
  for (let i = 0; i < 5; i++) {
    await prisma.stampEvent.create({ data: { cardId: card.id, customerId: customer.id, campaignId: campaign.id, branchId: tenant.branches[0].id, qrId: qr.id, delta: 1, status: 'granted', createdAt: new Date(Date.now() - i * 3 * 864e5) } });
  }

  console.log('\nSeed complete. Demo logins:');
  console.log('  Merchant owner : owner@brewbean.dev / owner1234');
  console.log('  Staff          : staff@brewbean.dev / staff1234');
  console.log(`  Super admin    : ${adminEmail} / ${adminPassword === 'admin1234' ? 'admin1234 (dev default — set ADMIN_PASSWORD!)' : '(from ADMIN_PASSWORD)'}`);
  console.log('  Customer email : neha@example.com (email OTP echoed in dev)');
  console.log(`  Demo QR token  : ${qr.token}\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
