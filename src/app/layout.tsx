/**
 * @file layout.tsx
 * @description Root layout for SaafSaans. Loads fonts and sets up accessibility structure.
 */

import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-display',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-mono',
  weight: ['400', '500'],
});

/** Root metadata for SaafSaans. */
export const metadata: Metadata = {
  title: {
    default: 'SaafSaans — साफ़ साँस',
    template: '%s | SaafSaans',
  },
  description: 'GenAI-powered winter smog assistant. Know your air, protect your lungs.',
  keywords: ['air quality', 'AQI', 'smog', 'PM2.5', 'Delhi', 'India', 'health'],
  authors: [{ name: 'SaafSaans Team' }],
  robots: { index: true, follow: true },
};

/** Root layout component wrapping all pages. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-body bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
