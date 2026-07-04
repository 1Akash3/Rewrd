'use client';
import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { merchantApi } from '@/lib/api';
import { BarChart, Card, Skeleton, StatTile } from '@/components/ui';
import { num } from '@/lib/format';

// Branch drill-down: '' = all branches, otherwise a branchId. Every number on
// this page re-scopes to the selected branch.
export default function AnalyticsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [top, setTop] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [trend, setTrend] = useState<{ date: string; scans: number }[]>([]);
  const [o, setO] = useState<any>(null);

  useEffect(() => { merchantApi.branches().then(setBranches); merchantApi.leaderboard().then(setBoard); }, []);

  useEffect(() => {
    setO(null);
    const id = branchId || undefined;
    Promise.all([merchantApi.topCampaigns(id), merchantApi.trend(id), merchantApi.overview(id)])
      .then(([a, c, d]) => { setTop(a); setTrend(c); setO(d); });
  }, [branchId]);

  const branchName = branchId ? branches.find((b) => b.id === branchId)?.name : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">Analytics</h1>
          <p className="text-sm text-muted">
            {branchName ? <>Showing <span className="font-semibold text-ink">{branchName}</span> only.</> : 'Deep-dive into scans, campaigns and branch performance.'}
          </p>
        </div>
        {branches.length > 1 && (
          <label className="flex items-center gap-2 rounded-full border-2 border-ink bg-surface py-1.5 pl-3.5 pr-2 shadow-hard-sm">
            <Store size={15} className="text-brand" aria-hidden />
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="cursor-pointer bg-transparent text-sm font-semibold text-ink outline-none"
              aria-label="Filter analytics by branch"
            >
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
        )}
      </div>

      {!o ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-52" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Card completion" value={`${o.rewardsUnlocked ? Math.round((o.completions / Math.max(o.totalCustomers, 1)) * 100) : 0}%`} sub="cards completing a cycle" />
            <StatTile label="Scan → redemption" value={`${o.redemptionRate}%`} />
            <StatTile label="Avg visits / customer" value={o.avgVisitsPerCustomer} />
            <StatTile label="Reward liability (open)" value={num(o.rewardsUnlocked - o.rewardsClaimed)} sub="unclaimed rewards" />
          </div>

          <Card className="p-5">
            <h2 className="mb-4 font-head font-bold text-ink">Scan trend {branchName && <span className="text-sm font-normal text-muted">· {branchName}</span>}</h2>
            <BarChart data={trend.map((t) => ({ label: t.date.slice(5), value: t.scans }))} height={160} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-head font-bold text-ink">Campaign performance {branchName && <span className="text-sm font-normal text-muted">· {branchName}</span>}</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted"><tr><th className="pb-2">Campaign</th><th className="pb-2">Stamps</th><th className="pb-2">Rewards</th></tr></thead>
                <tbody>
                  {top.map((c) => <tr key={c.id} className="border-t border-line"><td className="py-2 font-medium text-ink">{c.name}</td><td className="py-2 text-muted">{num(c.stamps)}</td><td className="py-2 text-muted">{num(c.rewards)}</td></tr>)}
                </tbody>
              </table>
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 font-head font-bold text-ink">Branch performance index</h2>
              {board.map((r, i) => (
                <button
                  key={r.branchId}
                  onClick={() => setBranchId(branchId === r.branchId ? '' : r.branchId)}
                  className={`flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-brand-soft ${branchId === r.branchId ? 'bg-brand-soft' : ''}`}
                  title={branchId === r.branchId ? 'Click to show all branches' : `Click to drill into ${r.name}`}
                >
                  <span className="w-5 text-sm text-muted">{i + 1}.</span>
                  <span className="flex-1 text-sm text-ink">{r.name}</span>
                  <span className="h-2 w-32 overflow-hidden rounded-full bg-line">
                    <span className="block h-full bg-brand" style={{ width: `${Math.min(100, (r.stamps / Math.max(1, board[0]?.stamps)) * 100)}%` }} />
                  </span>
                  <span className="w-12 text-right text-xs text-muted">{num(r.stamps)}</span>
                </button>
              ))}
              {board.length > 1 && <p className="mt-2 text-xs text-muted">Tip: click a branch to drill into its numbers.</p>}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
