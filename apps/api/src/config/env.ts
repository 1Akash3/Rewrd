import 'dotenv/config';

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiBaseUrl: req('API_BASE_URL', 'http://localhost:4000'),
  webBaseUrl: req('WEB_BASE_URL', 'http://localhost:3000'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: req('JWT_SECRET', 'dev-super-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
  otpDevEcho: (process.env.OTP_DEV_ECHO ?? 'true') === 'true',
  // Free-trial length in days (merchant "1 month free, then subscribe" model).
  trialDays: parseInt(process.env.TRIAL_DAYS ?? '30', 10),
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
};
