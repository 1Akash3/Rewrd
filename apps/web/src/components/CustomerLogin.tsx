'use client';
import { useState } from 'react';
import { customerApi, tokens } from '@/lib/api';
import { Button, Field } from '@/components/ui';

// Inline OTP login used across the customer app. On success, calls onDone.
export function CustomerLogin({ onDone, heading = 'Sign in to your rewards' }: { onDone: () => void; heading?: string }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('+91');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [devCode, setDevCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await customerApi.requestOtp(phone);
      if (r.devCode) { setDevCode(r.devCode); setCode(r.devCode); }
      setStep('code');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const r = await customerApi.verifyOtp(phone, code, name || undefined);
      tokens.set('customer', r.token);
      onDone();
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-2xl text-brand-fg">◎</div>
        <h1 className="text-xl font-bold text-ink">{heading}</h1>
        <p className="mt-1 text-sm text-muted">No app needed — sign in with your mobile number.</p>
      </div>
      {step === 'phone' ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <Field label="Mobile number"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required /></Field>
          {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Sending…' : 'Send OTP'}</Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <Field label="Enter OTP" hint={devCode ? `Dev code: ${devCode}` : `Sent to ${phone}`}><input className="input text-center text-lg tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required /></Field>
          <Field label="Your name (first time only)"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" /></Field>
          {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Verifying…' : 'Verify & continue'}</Button>
          <button type="button" className="w-full text-center text-sm text-muted" onClick={() => setStep('phone')}>← Change number</button>
        </form>
      )}
    </div>
  );
}
