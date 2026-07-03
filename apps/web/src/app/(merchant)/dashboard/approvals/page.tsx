'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Badge, Button, Card, EmptyState, Spinner } from '@/components/ui';
import { initials, timeAgo } from '@/lib/format';
import { CheckCircle2 } from 'lucide-react';

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[] | null>(null);
  const [busyId, setBusyId] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    merchantApi.pendingApprovals()
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  async function approve(eventId: string) {
    setBusyId(eventId);
    setMsg('');
    try {
      await merchantApi.approveStamp(eventId);
      setMsg('✓ Stamp approved successfully!');
      setTimeout(() => setMsg(''), 4000);
      load();
    } catch (e: any) {
      alert(e.message || 'Failed to approve stamp.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Stamp Approvals</h1>
        <p className="text-sm text-muted">Review and confirm stamp requests scanned at your counter.</p>
      </div>

      {msg && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-semibold animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          {msg}
        </div>
      )}

      {!items ? (
        <Spinner label="Loading pending approvals…" />
      ) : items.length === 0 ? (
        <EmptyState 
          title="No pending approvals" 
          hint="When customers scan a QR that requires staff confirmation, their requests will appear here in real-time." 
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id} className="border-b border-line last:border-0 hover:bg-canvas">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                          {initials(ev.customer?.name ?? ev.customer?.phone)}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{ev.customer?.name ?? 'Guest'}</p>
                          <p className="text-xs text-muted">{ev.customer?.phone ?? ev.customer?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{ev.campaign?.name}</p>
                      <p className="text-xs text-muted">Reward: {ev.campaign?.rewardTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{ev.branch?.name ?? 'Main Branch'}</td>
                    <td className="px-4 py-3 text-muted">{timeAgo(ev.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        disabled={busyId === ev.id}
                        onClick={() => approve(ev.id)}
                      >
                        {busyId === ev.id ? 'Approving…' : 'Approve Stamp'}
                      </Button>
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
