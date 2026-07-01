'use client';
import { useEffect, useState } from 'react';
import { api, tokens } from './api';

export interface CustomerSession { id: string; phone: string; name?: string | null }

// Loads the customer session (if a token exists). Does NOT redirect — the
// customer app shows an inline login screen when unauthenticated.
export function useCustomer() {
  const [state, setState] = useState<{ loading: boolean; customer: CustomerSession | null }>({ loading: true, customer: null });

  useEffect(() => {
    if (!tokens.get('customer')) { setState({ loading: false, customer: null }); return; }
    api.get<{ customer: CustomerSession }>('/auth/me', 'customer')
      .then((r) => setState({ loading: false, customer: r.customer }))
      .catch(() => { tokens.clear('customer'); setState({ loading: false, customer: null }); });
  }, []);

  return state;
}
