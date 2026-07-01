'use client';
import { useState } from 'react';
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

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!customer) return <CustomerLogin onDone={() => setReload((r) => r + 1)} heading="Sign in to your account" />;

  async function save() {
    setMsg('');
    try { await customerApi.updateProfile({ name: name || undefined, consent }); setMsg('✓ Saved'); }
    catch (e: any) { setMsg(e.message); }
  }
  function logout() { tokens.clear('customer'); location.href = '/app'; }

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-5 text-2xl font-bold text-ink">Account</h1>
      <Card className="p-5">
        <div className="mb-4">
          <p className="text-sm text-muted">Signed in as</p>
          <p className="font-semibold text-ink">{customer.phone}</p>
        </div>
        <div className="space-y-4">
          <Field label="Name"><input className="input" defaultValue={customer.name ?? ''} onChange={(e) => setName(e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Receive loyalty reminders &amp; offers</label>
          {msg && <p className="text-sm text-success">{msg}</p>}
          <Button onClick={save}>Save changes</Button>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-semibold text-ink">Privacy &amp; data</h2>
        <p className="mt-1 text-sm text-muted">You control your data. Export or delete it anytime.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn-outline text-sm" href="/api/me/me/export" target="_blank">Export my data</a>
          <button className="btn-ghost text-sm text-danger" onClick={async () => { if (confirm('Delete your account and personal data? This cannot be undone.')) { await customerApi.updateProfile({}); await fetch('/api/me/me', { method: 'DELETE', headers: { authorization: `Bearer ${tokens.get('customer')}` } }); logout(); } }}>Delete my account</button>
        </div>
      </Card>

      <button className="mt-6 w-full text-center text-sm text-muted" onClick={logout}>Log out</button>
    </div>
  );
}
