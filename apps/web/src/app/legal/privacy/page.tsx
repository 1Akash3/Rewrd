export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 prose-sm">
      <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink">
        <p>Loyalty OS helps local businesses run digital loyalty programs. We process the minimum data needed to deliver stamps and rewards: your mobile number, optional name/email, and your stamp/reward activity.</p>
        <h2 className="text-lg font-semibold">What we collect</h2>
        <ul className="list-disc pl-5 text-muted"><li>Mobile number (for OTP login).</li><li>Optional name, email, birthday.</li><li>Stamp and reward history at businesses you visit.</li><li>Device fingerprint and (with permission) location — used only for fraud prevention.</li></ul>
        <h2 className="text-lg font-semibold">Consent</h2>
        <p>Marketing messages are sent only with your explicit consent. You can withdraw consent or opt out at any time from Account → Privacy.</p>
        <h2 className="text-lg font-semibold">Your rights</h2>
        <p>You can export or delete your personal data at any time from the customer app (Account → Privacy → Export / Delete). Deletion removes personal identifiers while preserving anonymized aggregates required for accounting.</p>
        <h2 className="text-lg font-semibold">Data handling</h2>
        <p>Data is stored securely with tenant isolation. We follow Indian data-handling best practices and GDPR-style principles of data minimization and purpose limitation.</p>
      </div>
      <a href="/" className="btn-outline mt-8">← Back home</a>
    </main>
  );
}
