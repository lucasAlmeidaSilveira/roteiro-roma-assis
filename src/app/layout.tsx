import type { Metadata, Viewport } from 'next';

import { copy } from '@/lib/copy';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

import { fontBody, fontDisplay, fontMono } from './fonts';

import '@/styles/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
  // Roteiro pessoal: fora dos buscadores.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2029' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
