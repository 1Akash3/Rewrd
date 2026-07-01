'use client';
import { useMerchant } from '@/lib/useMerchant';
import { Card, Field, Spinner } from '@/components/ui';

export default function SettingsPage() {
  const { loading, tenant, user } = useMerchant();
  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted">Business profile, branding, growth links and data controls.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-ink">Business profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business name"><input className="input" defaultValue={tenant?.name} /></Field>
          <Field label="Public slug"><input className="input" defaultValue={tenant?.slug} /></Field>
          <Field label="Brand color"><input className="input" type="color" defaultValue={tenant?.brandColor ?? '#4f46e5'} /></Field>
          <Field label="Owner"><input className="input" defaultValue={user?.name} disabled /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-ink">Growth links</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Google review link"><input className="input" placeholder="https://g.page/r/..." /></Field>
          <Field label="Instagram"><input className="input" placeholder="@yourbrand" /></Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 font-semibold text-ink">Data &amp; privacy</h2>
        <p className="text-sm text-muted">Consent management, GDPR-style deletion and export are enforced by the platform. Customers can export or delete their data from the customer app.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn-outline" href="/api/crm/customers.csv">Export customer data (CSV)</a>
          <a className="btn-ghost" href="/legal/privacy" target="_blank">Privacy policy</a>
          <a className="btn-ghost" href="/legal/terms" target="_blank">Terms</a>
        </div>
      </Card>
    </div>
  );
}
