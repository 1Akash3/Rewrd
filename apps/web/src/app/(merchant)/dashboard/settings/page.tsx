'use client';
import { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';
import { ApiError, merchantApi, tokens } from '@/lib/api';
import { useMerchant } from '@/lib/useMerchant';
import { Button, Card, Field, Spinner } from '@/components/ui';

export default function SettingsPage() {
  const { loading, tenant, user } = useMerchant();
  const [form, setForm] = useState({ name: '', brandColor: '#7C44BD', reviewLink: '', instagram: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (tenant) setForm({
      name: tenant.name ?? '',
      brandColor: tenant.brandColor ?? '#7C44BD',
      reviewLink: tenant.reviewLink ?? '',
      instagram: tenant.instagram ?? '',
    });
  }, [tenant]);

  if (loading) return <Spinner />;

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setMsg(''); };

  async function save() {
    setBusy(true); setErr(''); setMsg('');
    try {
      await merchantApi.updateTenant({
        name: form.name,
        brandColor: form.brandColor,
        reviewLink: form.reviewLink || null,
        instagram: form.instagram || null,
      });
      setMsg('Saved — changes are live.');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not save settings');
    } finally { setBusy(false); }
  }

  // CSV export needs the auth header, so a plain <a href> would 401 — fetch
  // with the token and hand the blob to the browser instead.
  async function exportCsv() {
    setExporting(true); setErr('');
    try {
      const res = await fetch('/api/crm/customers.csv', { headers: { authorization: `Bearer ${tokens.get('merchant')}` } });
      if (!res.ok) throw new Error('Export failed — try again.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'customers.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setErr(e.message); } finally { setExporting(false); }
  }

  return (
    <div className="max-w-[720px] space-y-6">
      <div>
        <h1 className="font-head text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted">Business profile, branding, growth links and data controls.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-head font-bold text-ink">Business profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business name"><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Public slug" hint="Printed on QR posters — contact support to change it."><input className="input" defaultValue={tenant?.slug} disabled /></Field>
          <Field label="Brand color" hint="Used on your customers' stamp cards and scan page.">
            <div className="flex items-center gap-3">
              <input className="h-11 w-16 cursor-pointer rounded-md border-[1.5px] border-line" type="color" value={form.brandColor} onChange={(e) => set('brandColor', e.target.value)} />
              <span className="font-mono text-sm text-muted">{form.brandColor}</span>
            </div>
          </Field>
          <Field label="Owner"><input className="input" defaultValue={user?.name} disabled /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-head font-bold text-ink">Growth links</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Google review link" hint="Shown to customers right after they unlock a reward.">
            <input className="input" value={form.reviewLink} onChange={(e) => set('reviewLink', e.target.value)} placeholder="https://g.page/r/..." />
          </Field>
          <Field label="Instagram handle">
            <input className="input" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourbrand" />
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={busy || form.name.length < 2}>{busy ? 'Saving…' : 'Save changes'}</Button>
        {msg && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"><Check size={15} aria-hidden /> {msg}</span>}
        {err && <span className="text-sm text-danger">{err}</span>}
      </div>

      <Card className="p-5">
        <h2 className="mb-2 font-head font-bold text-ink">Data &amp; privacy</h2>
        <p className="text-sm text-muted">Consent management, GDPR-style deletion and export are enforced by the platform. Customers can export or delete their data from the customer app.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-outline" onClick={exportCsv} disabled={exporting}><Download size={15} aria-hidden /> {exporting ? 'Preparing…' : 'Export customer data (CSV)'}</button>
          <a className="btn-ghost" href="/legal/privacy" target="_blank">Privacy policy</a>
          <a className="btn-ghost" href="/legal/terms" target="_blank">Terms</a>
        </div>
      </Card>
    </div>
  );
}
