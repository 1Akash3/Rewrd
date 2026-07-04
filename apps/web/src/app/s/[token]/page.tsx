'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BadgePlus, Camera, Check, CircleAlert, Clock, Gift, MapPin, Star } from 'lucide-react';
import { customerApi, tokens } from '@/lib/api';
import { deviceFp, getGeo } from '@/lib/device';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { Mascot, Skeleton, SkeletonList, StampProgress, stampIcon } from '@/components/ui';

type Phase = 'resolving' | 'login' | 'ready' | 'granted' | 'pending' | 'error';

// The store QR landing page. ONE QR per store: scanning lists every live
// offer as a coupon; the customer picks one and taps "Add coupon" — that
// joins the program AND collects today's stamp in a single step.
// Handles: invalid QR, paused store, no offers, stale session, fraud hold.
export default function ScanPage({ params }: { params: { token: string } }) {
  const { loading, customer } = useCustomer();
  const [phase, setPhase] = useState<Phase>('resolving');
  const [ctx, setCtx] = useState<any>(null);
  const [addingId, setAddingId] = useState('');
  const [chosen, setChosen] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');

  // Resolve the QR context (public).
  useEffect(() => {
    customerApi.resolveQr(params.token)
      .then((c) => setCtx(c))
      .catch((e) => { setErr(e.message); setPhase('error'); });
  }, [params.token]);

  // Decide phase once we know auth + context.
  useEffect(() => {
    if (loading || !ctx || phase === 'error') return;
    if (phase === 'granted' || phase === 'pending') return;
    if (!customer && !tokens.get('customer')) { setPhase('login'); return; }
    setPhase('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ctx, customer]);

  const campaigns: any[] = ctx?.campaigns?.filter(Boolean) ?? [];
  const storePaused = ctx?.tenant?.status === 'suspended' || ctx?.tenant?.status === 'cancelled';
  const color = ctx?.tenant?.brandColor ?? 'rgb(var(--brand))';

  async function addCoupon(campaign: any) {
    setAddingId(campaign.id); setErr(''); setChosen(campaign);
    try {
      const geo = campaign.geoValidation ? await getGeo() : null;
      const res = await customerApi.earn({ token: params.token, campaignId: campaign.id, deviceFp: deviceFp(), lat: geo?.lat, lng: geo?.lng });
      setResult(res);
      setPhase(res.status === 'pending' ? 'pending' : 'granted');
    } catch (e: any) {
      // Session expired mid-scan → inline login instead of a dead end.
      if (e?.status === 401) { tokens.clear('customer'); setPhase('login'); return; }
      setErr(e.message);
    } finally { setAddingId(''); }
  }

  // Skeleton while the store resolves — feels instant, no spinner.
  if (phase === 'resolving' || (loading && phase !== 'error')) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-surface">
        <div className="space-y-2 px-5 py-5">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <div className="px-5 pt-3"><SkeletonList count={3} /></div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <Centered>
        <div className="text-center">
          <IconBadge tone="muted"><CircleAlert size={30} strokeWidth={2.25} /></IconBadge>
          <p className="mt-4 font-head text-xl font-bold text-ink">{err || 'This QR code is not active.'}</p>
          <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted">The code may have been replaced by the store. Ask the staff for the latest QR.</p>
          <Link href="/app" className="btn-outline mt-6">Go to my cards</Link>
        </div>
      </Centered>
    );
  }

  if (phase === 'login') {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-surface">
        <StoreHeader ctx={ctx} />
        <CustomerLogin heading={`See offers at ${ctx.tenant.name}`} onDone={() => setPhase('ready')} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-surface">
      <StoreHeader ctx={ctx} />
      <div className="px-5 py-6">
        {storePaused ? (
          <div className="text-center">
            <IconBadge tone="muted"><Clock size={30} strokeWidth={2.25} /></IconBadge>
            <h1 className="mt-4 font-head text-xl font-bold text-ink">This store is taking a break</h1>
            <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted">Offers are paused here right now. Your collected stamps are safe and will be waiting.</p>
            <Link href="/app" className="btn-outline mt-6 w-full">See my cards</Link>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center">
            <Mascot size={96} color="#7C44BD" className="mx-auto" />
            <h1 className="mt-4 font-head text-xl font-bold text-ink">No offer running right now</h1>
            <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted">
              {ctx.tenant.name} isn’t running a loyalty offer at the moment. Check back after your next visit!
            </p>
            <div className="mt-6 space-y-2.5">
              <Link href="/app/offers" className="btn-brand w-full">Explore other offers nearby</Link>
              <Link href="/app" className="btn-ghost w-full">Go to my cards</Link>
            </div>
          </div>
        ) : phase === 'granted' && result ? (
          <div className="relative text-center">
            {/* confetti */}
            <span className="animate-confetti absolute left-8 top-0 h-3.5 w-2.5 bg-citrine" />
            <span className="animate-confetti absolute right-10 top-1 h-3.5 w-2.5 bg-red" style={{ animationDuration: '1.7s' }} />
            <span className="animate-confetti absolute left-1/2 top-2 h-3.5 w-2.5 bg-jade" style={{ animationDuration: '1.3s' }} />
            <span className="animate-confetti absolute left-20 top-1 h-3.5 w-2.5 bg-brand" style={{ animationDuration: '1.9s' }} />
            {result.rewardUnlocked ? (
              <>
                <IconBadge tone="jade" className="animate-stamp"><Gift size={34} strokeWidth={2.25} /></IconBadge>
                <h1 className="mt-4 font-head text-3xl font-bold text-ink">Reward unlocked!</h1>
                <p className="mt-1 text-muted">You’ve earned <span className="font-semibold text-ink">{result.rewardUnlocked.rewardTitle}</span></p>
                <Mascot size={80} color="#34AD6C" className="mt-4" />
                
                {/* Growth Links */}
                {(ctx?.tenant?.reviewLink || ctx?.tenant?.instagram) && (
                  <div className="mt-6 space-y-3 p-4 rounded-2xl border-2 border-ink bg-canvas shadow-hard-sm text-left">
                    <p className="font-head font-bold text-sm text-ink">Support us &amp; follow our updates!</p>
                    <div className="flex flex-col gap-2">
                      {ctx.tenant.reviewLink && (
                        <a 
                          href={ctx.tenant.reviewLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-outline flex items-center justify-center gap-2 !py-2 text-xs font-semibold hover:bg-white"
                        >
                          <Star size={14} aria-hidden /> Leave a Google Review
                        </a>
                      )}
                      {ctx.tenant.instagram && (
                        <a 
                          href={`https://instagram.com/${ctx.tenant.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-outline flex items-center justify-center gap-2 !py-2 text-xs font-semibold hover:bg-white"
                        >
                          <Camera size={14} aria-hidden /> Follow us on Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <Link href="/app/wallet" className="btn-brand mt-6 w-full">View my reward</Link>
              </>
            ) : (
              <>
                <IconBadge tone="jade" className="animate-stamp"><Check size={36} strokeWidth={3} /></IconBadge>
                <h1 className="mt-5 font-head text-2xl font-bold text-ink">Coupon added!</h1>
                <p className="mt-1 text-sm text-muted">Today’s stamp is on the card — it lives in your wallet now.</p>
                <div className="mt-6 flex justify-center"><StampProgress current={result.card.stamps} total={result.card.stampsRequired} color={color} icon={stampIcon(ctx?.tenant?.name ?? '')} /></div>
                <p className="mt-4 text-muted">{result.card.stampsRequired - result.card.stamps} more → {chosen?.rewardTitle}</p>
                <Link href="/app" className="btn-brand mt-6 w-full">See my cards</Link>
              </>
            )}
          </div>
        ) : phase === 'pending' ? (
          <div className="text-center">
            <IconBadge tone="citrine"><Clock size={30} strokeWidth={2.25} /></IconBadge>
            <h1 className="mt-4 font-head text-xl font-bold text-ink">Waiting for staff</h1>
            <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-muted">Show this screen to a staff member to confirm your stamp.</p>
            <Link href="/app" className="btn-ghost mt-6 w-full">Back to my cards</Link>
          </div>
        ) : (
          <div>
            <h1 className="font-head text-xl font-bold text-ink">
              {campaigns.length === 1 ? 'Ongoing offer' : `${campaigns.length} offers running`}
            </h1>
            <p className="mb-4 mt-0.5 text-sm text-muted">Pick an offer — the coupon is added to your wallet with today’s stamp.</p>
            {err && <p className="mb-4 rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}

            <div className="space-y-3.5">
              {campaigns.map((c) => (
                <div key={c.id} className="overflow-hidden rounded-[20px] border-2 border-ink bg-surface shadow-hard-sm">
                  <div className="flex items-center gap-3.5 p-4">
                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[13px] border-2 border-ink text-white" style={{ background: color }}>
                      {stampIcon(ctx?.tenant?.name ?? '', 22)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-head text-[15px] font-bold text-ink">{c.name}</p>
                      <p className="text-[13px] text-muted"><span className="font-semibold text-ink">{c.rewardTitle}</span> after {c.stampsRequired} visits</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-dashed border-line px-4 py-3">
                    <button
                      onClick={() => addCoupon(c)}
                      disabled={!!addingId}
                      className="btn-brand w-full !py-2.5 text-sm"
                    >
                      <BadgePlus size={16} aria-hidden />
                      {addingId === c.id ? 'Adding your coupon…' : 'Add coupon'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-muted">By adding a coupon you agree to receive loyalty updates. Opt out anytime.</p>
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
      <p className="text-xs opacity-80">Welcome to</p>
      <p className="font-head text-lg font-bold">{ctx?.tenant?.name}</p>
      {ctx?.branch?.name && <p className="mt-0.5 flex items-center gap-1 text-sm opacity-90"><MapPin size={13} aria-hidden /> {ctx.branch.name}</p>}
    </div>
  );
}

function IconBadge({ children, tone, className = '' }: { children: React.ReactNode; tone: 'jade' | 'citrine' | 'muted'; className?: string }) {
  const bg = tone === 'jade' ? 'bg-jade text-white' : tone === 'citrine' ? 'bg-citrine text-ink' : 'bg-brand-soft text-brand';
  return <div className={`mx-auto grid h-[76px] w-[76px] place-items-center rounded-full border-2 border-ink shadow-hard-sm ${bg} ${className}`}>{children}</div>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid min-h-screen max-w-md place-items-center bg-surface px-5">{children}</div>;
}
