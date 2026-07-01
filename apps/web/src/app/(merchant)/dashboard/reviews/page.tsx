'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Card, Spinner, StatTile } from '@/components/ui';
import { num } from '@/lib/format';

export default function ReviewsPage() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { merchantApi.growthSummary().then(setS).catch(() => setS({})); }, []);
  if (!s) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Reviews &amp; Social</h1>
        <p className="text-sm text-muted">Turn loyalty moments into Google reviews and social follows.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Review prompts" value={num(s.reviewClicks ?? 0)} />
        <StatTile label="Reviews submitted" value={num(s.reviewsSubmitted ?? 0)} accent />
        <StatTile label="Review conversion" value={`${s.reviewConversion ?? 0}%`} />
        <StatTile label="Social clicks" value={num(s.socialClicks ?? 0)} />
      </div>
      <Card className="p-5">
        <h2 className="font-semibold text-ink">How it works</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted">
          <li>1. After a customer completes a reward, the app shows a “Rate us on Google” prompt.</li>
          <li>2. Optionally reward the customer with bonus stamps for following your Instagram or leaving a review.</li>
          <li>3. Every click and conversion is tracked here so you can see review growth over time.</li>
        </ol>
        <p className="mt-4 rounded-md bg-brand-soft p-3 text-sm text-brand">Configure your Google review link and social handles under Settings → Growth.</p>
      </Card>
    </div>
  );
}
