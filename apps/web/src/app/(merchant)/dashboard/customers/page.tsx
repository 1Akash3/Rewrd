'use client';
import { useEffect, useState } from 'react';
import { Download, Mail } from 'lucide-react';
import { merchantApi, tokens } from '@/lib/api';
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => { merchantApi.segments().then((s) => { setCounts(s.counts); setTotal(s.total); }); }, []);
  useEffect(() => { setList(null); merchantApi.customers(seg || undefined).then(setList); }, [seg]);

  // CSV needs the Bearer header — a plain <a href> would get a 401.
  async function exportCsv() {
    setExporting(true);
    try {
      const res = await fetch('/api/crm/customers.csv', { headers: { authorization: `Bearer ${tokens.get('merchant')}` } });
      if (!res.ok) throw new Error('Export failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = 'customers.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Export failed — please try again.'); } finally { setExporting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">Customers</h1>
          <p className="text-sm text-muted">{num(total)} customers captured through loyalty.</p>
        </div>
        <button onClick={exportCsv} disabled={exporting} className="btn-outline"><Download size={15} aria-hidden /> {exporting ? 'Preparing…' : 'Export CSV'}</button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">Cards</th>
                  <th className="px-4 py-3">Last visit</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3">Tag</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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
                          {c.progress && c.progress.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.progress.map((prog, idx) => (
                                <span key={idx} className="text-[10px] bg-brand-soft text-brand font-semibold rounded-md px-1.5 py-0.5 inline-block">
                                  🎯 {prog.campaignName}: {prog.stamps}/{prog.required}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{num(c.visits)}</td>
                    <td className="px-4 py-3 text-muted">{c.cards}</td>
                    <td className="px-4 py-3 text-muted">{timeAgo(c.lastVisit)}</td>
                    <td className="px-4 py-3">{c.consent ? '✓' : <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3"><Badge tone={c.tag}>{c.tag}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {c.email ? (
                        <ReminderButton customerId={c.id} email={c.email} />
                      ) : (
                        <span className="text-xs text-muted">No email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function ReminderButton({ customerId, email }: { customerId: string; email: string }) {
  const [status, setStatus] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function send() {
    setStatus('busy');
    setErr('');
    try {
      await merchantApi.remindCustomer(customerId);
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (e: any) {
      setErr(e.message || 'Failed');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <span className="text-xs font-semibold text-emerald-600 px-3 py-1">✓ Sent!</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={send}
        disabled={status === 'busy'}
        className="btn-outline !py-1 !px-2.5 text-xs flex items-center gap-1 hover:bg-canvas disabled:opacity-50"
        title={`Send stamp card reminder to ${email}`}
      >
        <Mail size={12} aria-hidden />
        {status === 'busy' ? 'Sending…' : 'Remind'}
      </button>
      {status === 'error' && <span className="text-[10px] text-danger" title={err}>Failed</span>}
    </div>
  );
}
