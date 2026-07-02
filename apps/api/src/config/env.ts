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
  // Customers stay logged in long-term so a returning scan never re-verifies —
  // they pay the SMS-OTP cost only on their very first scan.
  customerJwtExpiresIn: process.env.CUSTOMER_JWT_EXPIRES_IN ?? '180d',
  otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
  otpDevEcho: (process.env.OTP_DEV_ECHO ?? 'true') === 'true',
  // Free-trial length in days (merchant "1 month free, then subscribe" model).
  trialDays: parseInt(process.env.TRIAL_DAYS ?? '30', 10),
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',

  // ---- Google Sign-In (auto-login) ----
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',

  // ---- OTP delivery ----
  otp: {
    provider: (process.env.OTP_PROVIDER ?? 'echo') as 'echo' | 'whatsapp' | 'msg91' | 'twilio',
    // WhatsApp Cloud API (Meta) — free tier ~1,000 conversations/month, no DLT.
    whatsappToken: process.env.WHATSAPP_TOKEN ?? '',
    whatsappPhoneId: process.env.WHATSAPP_PHONE_ID ?? '',
    whatsappTemplate: process.env.WHATSAPP_OTP_TEMPLATE ?? 'otp_code',
    msg91AuthKey: process.env.MSG91_AUTH_KEY ?? '',
    msg91Sender: process.env.MSG91_SENDER_ID ?? '',
    twilioSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    twilioFrom: process.env.TWILIO_FROM ?? '',
  },

  // ---- Email (Resend — free tier 3,000/mo) ----
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Loyalty OS <onboarding@resend.dev>',

  // ---- Web Push (VAPID) ----
  vapidPublic: process.env.VAPID_PUBLIC_KEY ?? '',
  vapidPrivate: process.env.VAPID_PRIVATE_KEY ?? '',
  vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:support@loyaltyos.dev',

  // ---- Google Maps (reverse-geocode for branch detection) ----
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',

  // ---- Sentry ----
  sentryDsn: process.env.SENTRY_DSN ?? '',
};
