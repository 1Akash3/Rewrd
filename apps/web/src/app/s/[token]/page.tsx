'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { customerApi, tokens } from '@/lib/api';
import { deviceFp, getGeo } from '@/lib/device';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { Button, Spinner, StampProgress } from '@/components/ui';

type Phase = 'resolving' | 'login' | 'ready' | 'earning' | 'granted' | 'pending' | 'error';

// The QR landing page. A customer scans → lands here → earns a stamp instantly.
export default function ScanPage({ params }: { params: { token: string } }) {
  const { loading, customer } = useCustomer();
  const [phase, setPhase] = useState<Phase>('resolving');
  const [ctx, setCtx] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');
  const [authed, setAuthed] = useState(false);

  // Resolve the QR context (public).
  useEffect(() => {
    customerApi.resolveQr(params.token)
      .then((c) => { setCtx(c); })
      .catch((e) => { setErr(e.message); setPhase('error'); });
  }, [params.token]);

  // Decide phase once we know auth + context.
  useEffect(() => {
    if (loading || !ctx) return;
    if (!customer && !authed && !tokens.get('customer')) { setPhase('login'); return; }
    setPhase('ready');
  }, [loading, ctx, customer, authed]);

  const campaign = ctx?.campaigns?.[0];

  async function earn() {
    if (!campaign) return;
    setPhase('earning'); setErr('');
    try {
      const geo = campaign.geoValidation ? await getGeo() : null;
      const res = await customerApi.earn({ token: params.token, campaignId: campaign.id, deviceFp: deviceFp(), lat: geo?.lat, lng: geo?.lng });
      setResult(res);
      setPhase(res.status === 'pending' ? 'pending' : 'granted');
    } catch (e: any) {
      setErr(e.message); setPhase('ready');
    }
  }

  if (phase === 'resolving' || loading) return <Centered><Spinner label="Loading store…" /></Centered>;
  if (phase === 'error') return <Centered><div className="text-center"><p className="text-4xl">😕</p><p className="mt-2 font-semibold text-ink">{err || 'This QR is not active.'}</p><Link href="/app" className="btn-outline mt-4">Go to my cards</Link></div></Centered>;

  if (phase === 'login') {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-surface">
        <StoreHeader ctx={ctx} />
        <CustomerLogin heading={`Earn a stamp at ${ctx.tenant.name}`} onDone={() => setAuthed(true)} />
      </div>
    );
  }

  const color = ctx?.tenant?.brandColor ?? 'rgb(var(--brand))';

  return (
    <div className="mx-auto min-h-screen max-w-md bg-surface">
      <StoreHeader ctx={ctx} />
      <div className="px-5 py-6">
        {!campaign ? (
          <p className="text-center text-muted">This store has no active loyalty program right now.</p>
        ) : phase === 'granted' && result ? (
          <div className="text-center">
            {result.rewardUnlocked ? (
              <>
                <div className="text-6xl">🎉</div>
                <h1 className="mt-3 text-2xl font-bold text-ink">Reward unlocked!</h1>
                <p className="mt-1 text-muted">You’ve earned <span className="font-semibold text-ink">{result.rewardUnlocked.rewardTitle}</span></p>
                <Link href="/app/wallet" className="btn-brand mt-6 w-full">View my reward</Link>
              </>
            ) : (
              <>
                <div className="text-6xl animate-pop">⭐</div>
                <h1 className="mt-3 text-2xl font-bold text-ink">Stamp added!</h1>
                <div className="mt-6 flex justify-center"><StampProgress current={result.card.stamps} total={result.card.stampsRequired} color={color} /></div>
                <p className="mt-4 text-muted">{result.card.stampsRequired - result.card.stamps} more → {campaign.rewardTitle}</p>
                <Link href="/app" className="btn-outline mt-6 w-full">See all my cards</Link>
              </>
            )}
          </div>
        ) : phase === 'pending' ? (
          <div className="text-center">
            <div className="text-6xl">⏳</div>
            <h1 className="mt-3 text-xl font-bold text-ink">Waiting for staff</h1>
            <p className="mt-1 text-muted">Show this screen to a staff member to confirm your stamp.</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-2 grid h-16 w-16 mx-auto place-items-center rounded-2xl text-3xl text-white" style={{ background: color }}>☕</div>
            <h1 className="text-xl font-bold text-ink">{campaign.name}</h1>
            <p className="mt-1 text-muted">Reward: <span className="font-medium text-ink">{campaign.rewardTitle}</span> after {campaign.stampsRequired} stamps</p>
            {err && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
            <Button onClick={earn} disabled={phase === 'earning'} className="mt-6 w-full py-3 text-base">{phase === 'earning' ? 'Adding your stamp…' : '⭐ Collect my stamp'}</Button>
            <p className="mt-3 text-xs text-muted">By collecting, you agree to receive loyalty updates. You can opt out anytime.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreHeader({ ctx }: { ctx: any }) {
  const color = ctx?.tenant?.brandColor ?? 'rgb(var(--brand))';
  return (
    <div className="px-5 py-5 text-white" style={{ background: color }}>
      <p className="text-xs opacity-80">You’re collecting stamps at</p>
      <p className="text-lg font-bold">{ctx?.tenant?.name}</p>
      {ctx?.branch?.name && <p className="text-sm opacity-90">📍 {ctx.branch.name}</p>}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid min-h-screen max-w-md place-items-center bg-surface px-5">{children}</div>;
}
