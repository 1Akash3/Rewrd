import QRCode from 'qrcode';
import { env } from '../config/env.js';

// The URL a customer lands on when scanning a QR. Dynamic-redirect architecture:
// the token is opaque and resolves server-side to tenant/branch/campaign, so the
// same printed code can be repointed without reprinting.
export function scanUrl(token: string): string {
  return `${env.webBaseUrl}/s/${token}`;
}

export async function qrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(scanUrl(token), {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
    color: { dark: '#111827', light: '#ffffff' },
  });
}

export async function qrSvg(token: string): Promise<string> {
  return QRCode.toString(scanUrl(token), { type: 'svg', margin: 1 });
}
