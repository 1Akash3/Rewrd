'use client';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import type { Card as LoyaltyCard } from '@/lib/types';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { EmptyState, Spinner, StampProgress } from '@/components/ui';
import { timeAgo } from '@/lib/format';

export default function CustomerHome() {
  const { loading, customer } = useCustomer();
  const [cards, setCards] = useState<LoyaltyCard[] | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (customer) customerApi.cards().then(setCards).catch(() => setCards([]));
  }, [customer, reload]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!customer) return <CustomerLogin onDone={() => setReload((r) => r + 1)} />;

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <p className="text-sm text-muted">Hello{customer.name ? `, ${customer.name}` : ''} 👋</p>
        <h1 className="text-2xl font-bold text-ink">Your loyalty cards</h1>
      </header>

      {!cards ? <Spinner /> : cards.length === 0 ? (
        <EmptyState title="No cards yet" hint="Scan a QR code at a participating store to start collecting stamps." />
      ) : (
        <div className="space-y-4">
          {cards.map((c) => {
            const done = c.stamps === 0 && c.cyclesDone > 0;
            const color = c.brand.brandColor ?? 'rgb(var(--brand))';
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ background: `${color}14` }}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg text-white" style={{ background: color }}>{c.brand.name[0]}</div>
                    <div>
                      <p className="font-semibold text-ink">{c.brand.name}</p>
                      <p className="text-xs text-muted">{c.campaign.name}</p>
                    </div>
                  </div>
                  {c.cyclesDone > 0 && <span className="chip bg-emerald-100 text-emerald-800">{c.cyclesDone}× earned</span>}
                </div>
                <div className="px-5 py-4">
                  <StampProgress current={c.stamps} total={c.stampsRequired} color={color} />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted">{c.stampsRequired - c.stamps} more → <span className="font-medium text-ink">{c.campaign.rewardTitle}</span></span>
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
