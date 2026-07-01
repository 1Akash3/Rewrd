export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink">
        <p>By using Loyalty OS you agree to these terms. Loyalty OS is a B2B SaaS platform; merchants subscribe annually and end customers use the service free of charge.</p>
        <h2 className="text-lg font-semibold">Merchant responsibilities</h2>
        <p>Merchants are responsible for honouring the rewards they configure, for the accuracy of their business details, and for complying with applicable consumer-protection and tax laws (including GST).</p>
        <h2 className="text-lg font-semibold">Fair use &amp; fraud</h2>
        <p>Stamp fraud, self-scanning abuse and manipulation of the loyalty system are prohibited. We apply cooldowns, geo-fencing and velocity checks, and may suspend accounts that abuse the platform.</p>
        <h2 className="text-lg font-semibold">Billing</h2>
        <p>Subscriptions are billed annually. A free trial is provided without payment collection. Cancellations take effect at the end of the current term; grace periods apply to failed payments.</p>
        <h2 className="text-lg font-semibold">Liability</h2>
        <p>The service is provided “as is”. Reward liability rests with the issuing merchant, not the platform.</p>
      </div>
      <a href="/" className="btn-outline mt-8">← Back home</a>
    </main>
  );
}
