'use client';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import type { Card as LoyaltyCard } from '@/lib/types';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { CategoryTiles, Mascot, SkeletonStampCard, Spinner, StampProgress, stampIcon } from '@/components/ui';
import { timeAgo } from '@/lib/format';

export default function CustomerHome() {
  const { loading, customer } = useCustomer();
  const [cards, setCards] = useState<LoyaltyCard[] | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (customer) customerApi.cards().then(setCards).catch(() => setCards([]));
  }, [customer, reload]);

  if (loading) return <div className="space-y-4 px-4 pt-6"><SkeletonStampCard /><SkeletonStampCard /></div>;
  if (!customer) return <CustomerLogin onDone={() => setReload((r) => r + 1)} />;

  return (
    <div className="px-4 pt-6">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">Hello{customer.name ? `, ${customer.name}` : ''}</p>
          <h1 className="font-head text-[28px] font-bold tracking-[-0.02em] text-ink">Your cards</h1>
          {cards && cards.length > 0 && <p className="text-sm text-muted">{cards.length} stamp card{cards.length === 1 ? '' : 's'} in progress</p>}
        </div>
        <Mascot size={72} className="mb-1 mr-1" />
      </header>

      {!cards ? <div className="space-y-4"><SkeletonStampCard /><SkeletonStampCard /></div> : cards.length === 0 ? (
        <div className="text-center">
          <div className="card p-7">
            <Mascot size={110} color="#7C44BD" className="mx-auto" />
            <p className="mt-4 font-head text-xl font-bold text-ink">No cards yet!</p>
            <p className="mx-auto mt-1.5 max-w-[260px] text-sm text-muted">
              Scan a QR code at a participating store to start collecting stamps.
            </p>
            <CategoryTiles className="mt-6" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((c) => {
            const color = c.brand.brandColor ?? 'rgb(var(--brand))';
            const icon = stampIcon(c.brand.name);
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ background: `${color}14` }}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-ink text-xl shadow-hard-sm" style={{ background: color }}>
                      <span className="drop-shadow-sm">{icon}</span>
                    </div>
                    <div>
                      <p className="font-head font-bold text-ink">{c.brand.name}</p>
                      <p className="text-xs text-muted">{c.campaign.name}</p>
                    </div>
                  </div>
                  {c.cyclesDone > 0 && <span className="chip border-2 border-ink bg-lime text-ink">{c.cyclesDone}× earned</span>}
                </div>
                <div className="px-5 py-4">
                  <StampProgress current={c.stamps} total={c.stampsRequired} color={color} icon={icon} />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted">{c.stampsRequired - c.stamps} more → <span className="font-semibold text-ink">{c.campaign.rewardTitle}</span></span>
                    <span className="text-xs text-muted">{timeAgo(c.lastStampAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
