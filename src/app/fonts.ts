/**
 * Fontes self-hosted (src/fonts, licença OFL em src/fonts/LICENSES.txt).
 * Mesmas famílias do site antigo, sem depender do Google Fonts no build nem na viagem (offline).
 */
import localFont from 'next/font/local';

export const fontBody = localFont({
  src: [
    {
      path: '../fonts/atkinson-hyperlegible-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/atkinson-hyperlegible-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
});

export const fontDisplay = localFont({
  src: [
    { path: '../fonts/bricolage-grotesque-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/bricolage-grotesque-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Avenir Next', 'Segoe UI', 'sans-serif'],
});

export const fontMono = localFont({
  src: [{ path: '../fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});
