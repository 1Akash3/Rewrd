'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { customerApi, tokens } from '@/lib/api';
import { Button, Field, Logo } from '@/components/ui';

// Inline email-OTP login used across the customer app. Email is free to send
// (no SMS gateway); in dev the code is echoed back so testing needs no inbox.
export function CustomerLogin({ onDone, heading = 'Sign in to your rewards' }: { onDone: () => void; heading?: string }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [devCode, setDevCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await customerApi.requestOtp(email.trim());
      if (r.devCode) { setDevCode(r.devCode); setCode(r.devCode); }
      setStep('code');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await customerApi.verifyOtp(email.trim(), code.trim(), name.trim() || undefined);
      tokens.set('customer', r.token);
      onDone();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-10">
      <div className="mb-7 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-5 font-head text-2xl font-bold text-ink">{heading}</h1>
        <p className="mt-1.5 text-sm text-muted">No app, no password — a code lands in your inbox.</p>
      </div>

      {step === 'email' ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <Field label="Email address">
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input className="input !pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </div>
          </Field>
          {err && <p className="rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <Button type="submit" disabled={busy || !email.includes('@')} className="w-full">{busy ? 'Sending code…' : 'Email me a code'}</Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <Field label="6-digit code" hint={devCode ? `Dev code: ${devCode}` : `Sent to ${email}`}>
            <input
              className="input text-center font-head text-2xl font-bold tracking-[0.4em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              required
              autoFocus
            />
          </Field>
          <Field label="Your name (first time only)">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
          </Field>
          {err && <p className="rounded-md bg-red/10 px-3 py-2 text-sm text-danger">{err}</p>}
          <Button type="submit" disabled={busy || code.length !== 6} className="w-full">
            <ShieldCheck size={16} aria-hidden /> {busy ? 'Verifying…' : 'Verify & continue'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="inline-flex items-center gap-1 text-muted hover:text-ink" onClick={() => { setStep('email'); setCode(''); setErr(''); }}>
              <ArrowLeft size={14} aria-hidden /> Change email
            </button>
            <button type="button" className="font-semibold text-brand hover:underline" disabled={busy} onClick={(e) => requestOtp(e as any)}>
              Resend code
            </button>
          </div>
        </form>
      )}
      <p className="mt-6 text-center text-xs text-muted">
        Run a business? <Link href="/login" className="font-semibold text-brand">Business login →</Link>
      </p>
    </div>
  );
}
