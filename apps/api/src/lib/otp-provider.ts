import { env } from '../config/env.js';

// Pluggable OTP delivery. Set OTP_PROVIDER to switch. In dev (`echo`) the code is
// logged + returned in the API response so you can test without any provider.
// WhatsApp Cloud API is the recommended free path in India (no DLT registration).
export async function sendOtp(phone: string, code: string): Promise<void> {
  switch (env.otp.provider) {
    case 'whatsapp':
      return sendViaWhatsApp(phone, code);
    case 'msg91':
      return sendViaMsg91(phone, code);
    case 'twilio':
      return sendViaTwilio(phone, code);
    case 'echo':
    default:
      // eslint-disable-next-line no-console
      console.log(`[otp:echo] ${phone} -> ${code}`);
      return;
  }
}

// Meta WhatsApp Cloud API. Requires an approved template with one body variable
// (the code). Free tier covers ~1,000 conversations/month.
async function sendViaWhatsApp(phone: string, code: string) {
  const { whatsappToken, whatsappPhoneId, whatsappTemplate } = env.otp;
  if (!whatsappToken || !whatsappPhoneId) throw new Error('WhatsApp OTP not configured');
  const res = await fetch(`https://graph.facebook.com/v21.0/${whatsappPhoneId}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${whatsappToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace(/[^0-9]/g, ''),
      type: 'template',
      template: {
        name: whatsappTemplate,
        language: { code: 'en' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp OTP failed: ${res.status} ${await res.text()}`);
}

// MSG91 OTP (India). Uses a pre-registered flow/template on the MSG91 dashboard.
async function sendViaMsg91(phone: string, code: string) {
  const { msg91AuthKey, msg91Sender } = env.otp;
  if (!msg91AuthKey) throw new Error('MSG91 not configured');
  const url = new URL('https://control.msg91.com/api/v5/otp');
  url.searchParams.set('mobile', phone.replace(/[^0-9]/g, ''));
  url.searchParams.set('otp', code);
  if (msg91Sender) url.searchParams.set('sender', msg91Sender);
  const res = await fetch(url, { method: 'POST', headers: { authkey: msg91AuthKey } });
  if (!res.ok) throw new Error(`MSG91 OTP failed: ${res.status}`);
}

// Twilio SMS (global fallback).
async function sendViaTwilio(phone: string, code: string) {
  const { twilioSid, twilioToken, twilioFrom } = env.otp;
  if (!twilioSid || !twilioToken || !twilioFrom) throw new Error('Twilio not configured');
  const body = new URLSearchParams({ To: phone, From: twilioFrom, Body: `Your Rewrd code is ${code}` });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
    method: 'POST',
    headers: { authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'), 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Twilio OTP failed: ${res.status}`);
}
