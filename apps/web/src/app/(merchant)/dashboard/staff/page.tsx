'use client';
import { useEffect, useState } from 'react';
import { merchantApi } from '@/lib/api';
import { Badge, Button, Card, Field, Spinner } from '@/components/ui';
import { initials, timeAgo } from '@/lib/format';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[] | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const load = () => merchantApi.staff().then(setStaff);
  useEffect(() => { load(); merchantApi.branches().then(setBranches); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Staff</h1>
          <p className="text-sm text-muted">Invite cashiers and branch managers with scoped permissions.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ Invite staff'}</Button>
      </div>

      {showForm && <StaffForm branches={branches} onDone={() => { setShowForm(false); load(); }} />}

      {!staff ? <Spinner /> : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last login</th></tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-canvas">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{initials(s.name)}</div>
                        <div><p className="font-medium text-ink">{s.name}</p><p className="text-xs text-muted">{s.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize"><Badge>{s.role.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3 text-muted">{s.branch?.name ?? 'All'}</td>
                    <td className="px-4 py-3"><Badge tone={s.status === 'active' ? 'active' : 'low'}>{s.status}</Badge></td>
                    <td className="px-4 py-3 text-muted">{timeAgo(s.lastLoginAt)}</td>
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

function StaffForm({ branches, onDone }: { branches: any[]; onDone: () => void }) {
  const [f, setF] = useState({ name: '', email: '', role: 'staff', branchId: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await merchantApi.createStaff({ ...f, branchId: f.branchId || undefined }); onDone(); }
    catch (e: any) { setErr(e.message); setBusy(false); }
  }
  return (
    <Card className="p-5">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-5">
        <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
        <Field label="Email"><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
        <Field label="Role"><select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="staff">Staff</option><option value="branch_manager">Branch manager</option><option value="support">Support</option></select></Field>
        <Field label="Branch"><select className="input" value={f.branchId} onChange={(e) => setF({ ...f, branchId: e.target.value })}><option value="">All</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
        <Field label="Temp password"><input className="input" type="text" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={6} /></Field>
        {err && <p className="md:col-span-5 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
        <div className="md:col-span-5"><Button type="submit" disabled={busy}>{busy ? 'Inviting…' : 'Invite'}</Button></div>
      </form>
    </Card>
  );
}
