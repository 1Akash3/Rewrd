'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, merchantApi, tokens } from '@/lib/api';
import { Button, Field } from '@/components/ui';

const businessTypes = ['cafe', 'salon', 'gym', 'bakery', 'restaurant', 'boutique', 'carwash', 'other'];

// Two-step onboarding wizard (business → account). Trial activates on submit.
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ businessName: '', businessType: 'cafe', ownerName: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await merchantApi.signup(form);
      tokens.set('merchant', res.token);
      router.push('/dashboard?welcome=1');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Signup failed');
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((s) => <span key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand' : 'bg-line'}`} />)}
      </div>
      <h1 className="text-2xl font-bold text-ink">{step === 1 ? 'Tell us about your business' : 'Create your account'}</h1>
      <p className="mt-1 text-sm text-muted">Step {step} of 2 · 30-day free trial, no card needed.</p>

      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <Field label="Business name"><input className="input" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="e.g. Brew & Bean" /></Field>
          <Field label="Business type">
            <select className="input" value={form.businessType} onChange={(e) => set('businessType', e.target.value)}>
              {businessTypes.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
            </select>
          </Field>
          <Button className="w-full" disabled={form.businessName.length < 2} onClick={() => setStep(2)}>Continue</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Your name"><input className="input" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} required /></Field>
          <Field label="Email"><input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></Field>
          <Field label="Password" hint="At least 6 characters"><input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} /></Field>
          {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="submit" disabled={busy} className="flex-1">{busy ? 'Creating…' : 'Start free trial'}</Button>
          </div>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-brand">Log in</Link></p>
    </div>
  );
}
