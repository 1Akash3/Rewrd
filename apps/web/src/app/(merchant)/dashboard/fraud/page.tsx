'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Badge, Card, EmptyState, Spinner } from '@/components/ui';
import { timeAgo } from '@/lib/format';

const kindLabels: Record<string, string> = {
  velocity: 'Velocity spike', duplicate: 'Duplicate scan', geo_out_of_range: 'Out of geo-fence',
  shared_device: 'Shared device', cooldown: 'Cooldown breach', suspicious_branch: 'Suspicious branch', geo_missing: 'Missing location',
};

export default function FraudPage() {
  const [alerts, setAlerts] = useState<any[] | null>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const load = () => { merchantApi.fraudAlerts().then(setAlerts); merchantApi.auditLog().then(setAudit); };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Fraud &amp; Audit</h1>
        <p className="text-sm text-muted">Suspicious activity and a full audit trail of every action.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-ink">Fraud alerts</h2>
        {!alerts ? <Spinner /> : alerts.length === 0 ? (
          <EmptyState title="No fraud alerts" hint="Cooldowns, geo-fencing and velocity checks are running silently in the background." />
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md bg-canvas p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{kindLabels[a.kind] ?? a.kind}</p>
                  <p className="text-xs text-muted">{timeAgo(a.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.severity}>{a.severity}</Badge>
                  <Badge tone={a.status === 'open' ? 'open' : 'low'}>{a.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-semibold text-ink">Audit log</div>
        {audit.length === 0 ? <p className="p-6 text-center text-sm text-muted">No audit entries yet.</p> : (
          <div className="max-h-96 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {audit.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs text-brand">{l.action}</td>
                      <td className="px-4 py-2.5 text-muted">{l.target ?? ''}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted">{timeAgo(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
