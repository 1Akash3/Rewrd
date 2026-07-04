// End-to-end smoke test of the core loyalty loop against a live server.
// Run: `npm run test` (expects `npm run db:setup` to have been run first).
// Self-cleaning: the Test Cafe tenant + test customer are deleted at the end
// so repeated runs never accumulate junk in the database.
import { createApp } from '../app.js';
import { prisma } from '../db/prisma.js';

const PORT = 4555;
const base = `http://localhost:${PORT}/api`;
let passed = 0;
let failed = 0;

function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
  else { failed++; console.log(`  \x1b[31m✗ ${msg}\x1b[0m`); }
}

async function j(method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as any };
}

async function run() {
  const app = createApp();
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 300));
  try {
    console.log('\nSmoke test: core loyalty loop\n');
    const fp1 = `fp-${Date.now()}-a`;
    const fp2 = `fp-${Date.now()}-b`;

    // 1) Merchant signup
    const email = `owner+${Date.now()}@test.dev`;
    const signup = await j('POST', '/auth/merchant/signup', { businessName: 'Test Cafe', businessType: 'cafe', ownerName: 'Test Owner', email, password: 'secret123' });
    assert(signup.status === 201 && signup.json.data?.token, 'merchant signup returns token');
    const mToken = signup.json.data.token;

    // 2) Create a campaign
    const camp = await j('POST', '/campaigns', { name: 'Buy 3 get 1', type: 'visit', stampsRequired: 3, rewardTitle: 'Free coffee', cooldownMinutes: 0, perCustomerDailyLimit: 10 }, mToken);
    assert(camp.status === 201 && camp.json.data?.id, 'campaign created');
    const campaignId = camp.json.data.id;

    // 3) The branch's evergreen QR (one QR per branch; GET self-provisions)
    const qrs = await j('GET', '/qr', undefined, mToken);
    const qr = qrs.json.data[0];
    assert(!!qr?.token && !qr?.campaignId, 'branch has one evergreen store QR');

    // 4) Public resolve of the QR
    const resolve = await j('GET', `/public/resolve/${qr.token}`);
    assert(resolve.status === 200 && resolve.json.data?.tenant, 'public QR resolve works');

    // 5) Customer email-OTP login (phone captured as optional contact data)
    const custEmail = `cust+${Date.now()}@test.dev`;
    const otpReq = await j('POST', '/auth/customer/otp/request', { email: custEmail });
    assert(!!otpReq.json.data?.devCode, 'email OTP requested (dev echo)');
    const otpVer = await j('POST', '/auth/customer/otp/verify', { email: custEmail, code: otpReq.json.data.devCode, name: 'Test Customer', phone: '+919812345678' });
    assert(otpVer.status === 200 && otpVer.json.data?.token, 'email OTP verified, customer token issued');
    const cToken = otpVer.json.data.token;

    // 6) Earn stamps to threshold → reward unlock
    let unlocked: any = null;
    for (let i = 0; i < 3; i++) {
      const earn = await j('POST', '/stamps/earn', { token: qr.token, campaignId, deviceFp: fp1 }, cToken);
      assert(earn.status === 201, `stamp ${i + 1} granted`);
      if (earn.json.data?.rewardUnlocked) unlocked = earn.json.data.rewardUnlocked;
    }
    assert(!!unlocked?.token, 'reward unlocked at threshold');

    // 7) Customer wallet shows the reward
    const wallet = await j('GET', '/me/rewards', undefined, cToken);
    assert(wallet.json.data?.some((r: any) => r.token === unlocked.token), 'reward appears in customer wallet');

    // 8) Staff claims the reward
    const claim = await j('POST', `/rewards/${unlocked.token}/claim`, { notes: 'verified at counter' }, mToken);
    assert(claim.status === 200 && claim.json.data?.claimed, 'staff claims reward');
    const claimAgain = await j('POST', `/rewards/${unlocked.token}/claim`, {}, mToken);
    assert(claimAgain.status === 400, 'double-claim is blocked');

    // 9) Analytics overview reflects activity
    const overview = await j('GET', '/analytics/overview', undefined, mToken);
    assert(overview.json.data?.rewardsClaimed >= 1, 'analytics overview counts the claim');

    // 10) Fraud: cooldown blocks a too-fast stamp (same branch QR, new campaign)
    const camp2 = await j('POST', '/campaigns', { name: 'Cooldown test', stampsRequired: 5, rewardTitle: 'Free item', cooldownMinutes: 60, perCustomerDailyLimit: 10 }, mToken);
    const e1 = await j('POST', '/stamps/earn', { token: qr.token, campaignId: camp2.json.data.id, deviceFp: fp2 }, cToken);
    const e2 = await j('POST', '/stamps/earn', { token: qr.token, campaignId: camp2.json.data.id, deviceFp: fp2 }, cToken);
    assert(e1.status === 201 && e2.status === 400, 'cooldown blocks rapid second stamp');

    // 11) Clean up everything this run created.
    const me = await j('GET', '/auth/me', undefined, mToken);
    const testTenantId = me.json.data?.tenant?.id;
    if (testTenantId) await prisma.tenant.delete({ where: { id: testTenantId } });
    await prisma.customer.deleteMany({ where: { email: custEmail } });
    await prisma.otpChallenge.deleteMany({ where: { email: custEmail } });
    console.log('  (test data cleaned up)');

    console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
  process.exit(failed === 0 ? 0 : 1);
}

run();
