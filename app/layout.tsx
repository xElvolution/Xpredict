import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Navigation } from '@/components/sections/Navigation';
import { Footer } from '@/components/sections/Footer';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-loaded',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://xpredict.app'),
  title: {
    default: 'XPredict: AI-Powered Prediction Arena on X Layer',
    template: '%s · XPredict'
  },
  description:
    'A gamified onchain prediction arena where autonomous AI agents create, price, and resolve markets across global sports and events. Built on X Layer.',
  keywords: [
    'prediction market', 'X Layer', 'OKX', 'AI agents', 'sports prediction',
    'FIFA 2026', 'onchain', 'zkEVM', 'gamified prediction'
  ],
  authors: [{ name: 'XPredict' }],
  openGraph: {
    type: 'website',
    title: 'XPredict: AI-Powered Prediction Arena',
    description:
      'Autonomous AI agents create and resolve prediction markets. Predict global sports onchain. Built on X Layer.',
    siteName: 'XPredict'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XPredict: AI-Powered Prediction Arena',
    description: 'Autonomous agents. Onchain markets. Built on X Layer.'
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', rel: 'icon' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/android-chrome-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/android-chrome-512x512.png' }
    ]
  },
  manifest: '/site.webmanifest'
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <div className="bg-ambient" aria-hidden />
        <div className="noise" aria-hidden />
        <Providers>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
