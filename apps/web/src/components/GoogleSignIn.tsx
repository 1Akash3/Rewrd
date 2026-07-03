'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, merchantApi, tokens } from '@/lib/api';

// Google Identity Services renders its own button into a container div. We load
// the GSI script once, initialize with our OAuth Web Client ID, and hand the
// returned ID token to the API. Existing accounts log in; new ones are
// auto-provisioned server-side (one-click signup — no password).

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(s);
  });
}

export function GoogleSignIn({ label = 'signin_with' }: { label?: 'signin_with' | 'signup_with' }) {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    async function handleCredential(credential: string) {
      try {
        const res = await merchantApi.google(credential);
        tokens.set('merchant', res.token);
        router.push(res.user.role === 'superadmin' ? '/admin' : '/dashboard');
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : 'Google sign-in failed');
      }
    }

    loadGsiScript()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID!,
          callback: (resp) => handleCredential(resp.credential),
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          text: label,
          shape: 'pill',
          width: 320,
        });
      })
      .catch(() => setErr('Could not load Google Sign-In'));

    return () => {
      cancelled = true;
    };
  }, [label, router]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <div ref={btnRef} className="flex justify-center" />
      {err && <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
    </div>
  );
}
