import type { Metadata, Viewport } from 'next';

import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { Footer } from '@/components/shell/Footer';
import { Header } from '@/components/shell/Header';
import { SectionsNav } from '@/components/shell/SectionsNav';
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
  // Barra de status do iPhone = --surface claro (#ffffff), a cor do cabeçalho fixo; tema padrão claro (D-13).
  // O manifesto usa --accent (#2c5a86) como theme_color para o ícone/splash, conforme RF-15.1.
  themeColor: '#ffffff',
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
      <body>
        <Header />
        {children}
        <Footer />
        <SectionsNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
