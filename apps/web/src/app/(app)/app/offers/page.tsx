'use client';
import { Card } from '@/components/ui';

const offers = [
  { brand: 'Brew & Bean', emoji: '☕', text: 'Buy 8 get 1 free coffee', tag: 'Popular' },
  { brand: 'Glow Salon', emoji: '💇', text: 'Every 5th haircut free', tag: 'New' },
  { brand: 'FitZone Gym', emoji: '🏋️', text: 'Refer a friend, get a free week', tag: 'Referral' },
];

export default function OffersPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">Offers near you</h1>
      <p className="mb-5 text-sm text-muted">Discover participating local businesses.</p>
      <div className="space-y-3">
        {offers.map((o) => (
          <Card key={o.brand} className="flex items-center gap-4 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-2xl">{o.emoji}</div>
            <div className="flex-1">
              <p className="font-semibold text-ink">{o.brand}</p>
              <p className="text-sm text-muted">{o.text}</p>
            </div>
            <span className="chip bg-brand-soft text-brand">{o.tag}</span>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted">Scan a store’s QR to join its loyalty program.</p>
    </div>
  );
}
