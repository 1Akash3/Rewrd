import { Resend } from 'resend';
import { env } from '../config/env.js';

// Transactional email via Resend (free tier: 3,000/mo). No-ops with a log line
// when RESEND_API_KEY is unset so dev/local never fails on missing config.
const client = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!client) {
    // eslint-disable-next-line no-console
    console.log(`[email:stub] to=${input.to} subject="${input.subject}"`);
    return false;
  }
  try {
    await client.emails.send({ from: env.emailFrom, to: input.to, subject: input.subject, html: input.html });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] send failed', err);
    return false;
  }
}
