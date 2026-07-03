import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rewrd — QR loyalty for local businesses',
  description:
    'Turn every visit into a repeat customer. Launch a QR loyalty program in minutes — customers scan, collect digital stamps with no app download, and unlock free rewards.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#7C44BD',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Rewrd type system: Familjen Grotesk (display) + General Sans (body). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
