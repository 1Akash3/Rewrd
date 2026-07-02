import * as Sentry from '@sentry/node';
import { env } from '../config/env.js';

export const sentryEnabled = Boolean(env.sentryDsn);

// Initialise Sentry as early as possible. No-op when SENTRY_DSN is unset.
export function initObservability() {
  if (!sentryEnabled) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.isProd ? 0.1 : 1.0,
  });
  // eslint-disable-next-line no-console
  console.log('[observability] Sentry initialised');
}

export function captureError(err: unknown) {
  if (sentryEnabled) Sentry.captureException(err);
}
