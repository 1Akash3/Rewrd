'use client';
import { useState } from 'react';
import { Check, Download, LogOut, Trash2 } from 'lucide-react';
import { customerApi, tokens } from '@/lib/api';
import { useCustomer } from '@/lib/useCustomer';
import { CustomerLogin } from '@/components/CustomerLogin';
import { Button, Card, Field, Spinner } from '@/components/ui';

export default function AccountPage() {
  const { loading, customer } = useCustomer();
  const [reload, setReload] = useState(0);
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busyExport, setBusyExport] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!customer) return <CustomerLogin onDone={() => setReload((r) => r + 1)} heading="Sign in to your account" />;

  async function save() {
    setMsg(''); setErr('');
    try { await customerApi.updateProfile({ name: name || undefined, consent }); setMsg('Saved'); }
    catch (e: any) { setErr(e.message); }
  }
  function logout() { tokens.clear('customer'); location.href = '/app'; }

  // Data export needs the Bearer header — a plain link would 401.
  async function exportData() {
    setBusyExport(true); setErr('');
    try {
      const res = await fetch('/api/me/me/export', { headers: { authorization: `Bearer ${tokens.get('customer')}` } });
      if (!res.ok) throw new Error('Export failed — try again.');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = 'my-rewrd-data.json'; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setErr(e.message); } finally { setBusyExport(false); }
  }

  async function deleteAccount() {
    if (!confirm('Delete your account and personal data? This cannot be undone.')) return;
    setBusyDelete(true); setErr('');
    try {
      const res = await fetch('/api/me/me', { method: 'DELETE', headers: { authorization: `Bearer ${tokens.get('customer')}` } });
      if (!res.ok) throw new Error('Could not delete your account — please try again.');
      logout();
    } catch (e: any) { setErr(e.message); setBusyDelete(false); }
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-5 font-head text-[28px] font-bold tracking-[-0.02em] text-ink">Account</h1>
      <Card className="p-5">
        <div className="mb-4">
          <p className="text-sm text-muted">Signed in as</p>
          <p className="font-semibold text-ink">{(customer as any).email ?? customer.phone}</p>
        </div>
        <div className="space-y-4">
          <Field label="Name"><input className="input" defaultValue={customer.name ?? ''} onChange={(e) => setName(e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Receive loyalty reminders &amp; offers</label>
          {msg && <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"><Check size={14} aria-hidden /> {msg}</p>}
          <Button onClick={save}>Save changes</Button>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-head font-bold text-ink">Privacy &amp; data</h2>
        <p className="mt-1 text-sm text-muted">You control your data. Export or delete it anytime.</p>
        {err && <p className="mt-2 rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-outline text-sm" onClick={exportData} disabled={busyExport}>
            <Download size={14} aria-hidden /> {busyExport ? 'Preparing…' : 'Export my data'}
          </button>
          <button className="btn-ghost text-sm text-danger" onClick={deleteAccount} disabled={busyDelete}>
            <Trash2 size={14} aria-hidden /> {busyDelete ? 'Deleting…' : 'Delete my account'}
          </button>
        </div>
      </Card>

      <button className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink" onClick={logout}><LogOut size={14} aria-hidden /> Log out</button>
    </div>
  );
}
