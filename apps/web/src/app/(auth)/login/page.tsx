'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, merchantApi, tokens } from '@/lib/api';
import { Button, Field } from '@/components/ui';
import { GoogleSignIn } from '@/components/GoogleSignIn';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await merchantApi.login({ email, password });
      tokens.set('merchant', res.token);
      router.push(res.user.role === 'superadmin' ? '/admin' : '/dashboard');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to your merchant dashboard.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Logging in…' : 'Log in'}</Button>
      </form>
      <GoogleSignIn label="signin_with" />
      <p className="mt-4 text-center text-sm text-muted">New here? <Link href="/signup" className="font-semibold text-brand">Start a free trial</Link></p>
      <div className="mt-5 rounded-2xl border-[1.5px] border-line bg-canvas px-4 py-3 text-center text-sm text-muted">
        Looking for your stamp cards? <Link href="/app" className="font-semibold text-brand">Customer sign in →</Link>
      </div>
    </div>
  );
}
