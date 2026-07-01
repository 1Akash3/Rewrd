import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Loyalty OS — QR-first digital loyalty for local businesses',
  description:
    'Replace paper stamp cards with a QR-first digital loyalty program. Increase repeat customers, reward loyalty, capture customer data, and see real-time analytics.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
