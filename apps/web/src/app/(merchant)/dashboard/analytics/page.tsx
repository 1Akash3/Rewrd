'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { BarChart, Card, Spinner, StatTile } from '@/components/ui';
import { num } from '@/lib/format';

export default function AnalyticsPage() {
  const [top, setTop] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [trend, setTrend] = useState<{ date: string; scans: number }[]>([]);
  const [o, setO] = useState<any>(null);
  useEffect(() => {
    Promise.all([merchantApi.topCampaigns(), merchantApi.leaderboard(), merchantApi.trend(), merchantApi.overview()])
      .then(([a, b, c, d]) => { setTop(a); setBoard(b); setTrend(c); setO(d); });
  }, []);
  if (!o) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-sm text-muted">Deep-dive into scans, campaigns and branch performance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Card completion" value={`${o.rewardsUnlocked ? Math.round((o.completions / Math.max(o.totalCustomers, 1)) * 100) : 0}%`} sub="cards completing a cycle" />
        <StatTile label="Scan → redemption" value={`${o.redemptionRate}%`} />
        <StatTile label="Avg visits / customer" value={o.avgVisitsPerCustomer} />
        <StatTile label="Reward liability (open)" value={num(o.rewardsUnlocked - o.rewardsClaimed)} sub="unclaimed rewards" />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-ink">Scan trend</h2>
        <BarChart data={trend.map((t) => ({ label: t.date.slice(5), value: t.scans }))} height={160} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Campaign performance</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted"><tr><th className="pb-2">Campaign</th><th className="pb-2">Stamps</th><th className="pb-2">Rewards</th></tr></thead>
            <tbody>
              {top.map((c) => <tr key={c.id} className="border-t border-line"><td className="py-2 font-medium text-ink">{c.name}</td><td className="py-2 text-muted">{num(c.stamps)}</td><td className="py-2 text-muted">{num(c.rewards)}</td></tr>)}
            </tbody>
          </table>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink">Branch performance index</h2>
          {board.map((r, i) => (
            <div key={r.branchId} className="flex items-center gap-3 py-1.5">
              <span className="w-5 text-sm text-muted">{i + 1}.</span>
              <span className="flex-1 text-sm text-ink">{r.name}</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-brand" style={{ width: `${Math.min(100, (r.stamps / Math.max(1, board[0]?.stamps)) * 100)}%` }} />
              </div>
              <span className="w-12 text-right text-xs text-muted">{num(r.stamps)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
