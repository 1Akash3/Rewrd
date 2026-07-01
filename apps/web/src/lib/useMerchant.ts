'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { merchantApi, tokens } from './api';
import type { MerchantUser, Tenant } from './types';

// Client-side auth guard + session loader for merchant pages.
export function useMerchant() {
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; user?: MerchantUser; tenant?: Tenant | null }>({ loading: true });

  useEffect(() => {
    if (!tokens.get('merchant')) { router.replace('/login'); return; }
    merchantApi.me()
      .then((r) => setState({ loading: false, user: r.user, tenant: r.tenant }))
      .catch(() => { tokens.clear('merchant'); router.replace('/login'); });
  }, [router]);

  return state;
}

export function logoutMerchant(router: ReturnType<typeof useRouter>) {
  tokens.clear('merchant');
  router.replace('/login');
}
