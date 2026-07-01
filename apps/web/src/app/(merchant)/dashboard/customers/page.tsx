'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import type { CrmCustomer } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { initials, num, timeAgo } from '@/lib/format';

const segments = [
  ['', 'All'], ['new', 'New'], ['loyal', 'Loyal'], ['vip', 'VIP'],
  ['almost', 'Almost reward'], ['dormant', 'Dormant'], ['active', 'Active'],
] as const;

export default function CustomersPage() {
  const [list, setList] = useState<CrmCustomer[] | null>(null);
  const [seg, setSeg] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => { merchantApi.segments().then((s) => { setCounts(s.counts); setTotal(s.total); }); }, []);
  useEffect(() => { setList(null); merchantApi.customers(seg || undefined).then(setList); }, [seg]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Customers</h1>
          <p className="text-sm text-muted">{num(total)} customers captured through loyalty.</p>
        </div>
        <a href="/api/crm/customers.csv" className="btn-outline">⬇ Export CSV</a>
      </div>

      <div className="flex flex-wrap gap-2">
        {segments.map(([key, label]) => (
          <button key={key} onClick={() => setSeg(key)} className={`chip ${seg === key ? 'bg-brand text-brand-fg' : 'bg-brand-soft text-brand hover:brightness-95'}`}>
            {label}{key && counts[key] ? ` · ${counts[key]}` : ''}
          </button>
        ))}
      </div>

      {!list ? <Spinner /> : list.length === 0 ? (
        <EmptyState title="No customers in this segment" hint="Customers appear here as they scan and earn stamps." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Cards</th>
                <th className="px-4 py-3">Last visit</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Tag</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{initials(c.name ?? c.phone)}</div>
                      <div>
                        <p className="font-medium text-ink">{c.name ?? 'Guest'}</p>
                        <p className="text-xs text-muted">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{num(c.visits)}</td>
                  <td className="px-4 py-3 text-muted">{c.cards}</td>
                  <td className="px-4 py-3 text-muted">{timeAgo(c.lastVisit)}</td>
                  <td className="px-4 py-3">{c.consent ? '✓' : <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-3"><Badge tone={c.tag}>{c.tag}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
