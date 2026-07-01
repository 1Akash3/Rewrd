'use client';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import type { RewardWalletItem } from '@/lib/types';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { Badge, EmptyState, Spinner } from '@/components/ui';
import { dateStr } from '@/lib/format';

export default function WalletPage() {
  const { loading, customer } = useCustomer();
  const [items, setItems] = useState<RewardWalletItem[] | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => { if (customer) customerApi.wallet().then(setItems).catch(() => setItems([])); }, [customer, reload]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!customer) return <CustomerLogin onDone={() => setReload((r) => r + 1)} heading="Sign in to see your rewards" />;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-5 text-2xl font-bold text-ink">Reward wallet</h1>
      {!items ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="No rewards yet" hint="Fill a stamp card to unlock your first reward." />
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <div key={r.id} className={`card overflow-hidden ${r.status !== 'unlocked' ? 'opacity-60' : ''}`}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">🎁 {r.rewardTitle}</p>
                  <Badge tone={r.status}>{r.status}</Badge>
                </div>
                <p className="text-sm text-muted">{r.brand} · {r.campaign}</p>
                {r.status === 'unlocked' && (
                  <div className="mt-4 rounded-lg border border-dashed border-brand bg-brand-soft p-4 text-center">
                    <p className="text-xs text-muted">Show this code to staff to redeem</p>
                    <p className="mt-1 select-all break-all font-mono text-sm font-bold tracking-wide text-brand">{r.token}</p>
                    {r.expiresAt && <p className="mt-2 text-xs text-muted">Expires {dateStr(r.expiresAt)}</p>}
                  </div>
                )}
                {r.status === 'claimed' && <p className="mt-2 text-xs text-success">✓ Claimed {dateStr(r.claimedAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
