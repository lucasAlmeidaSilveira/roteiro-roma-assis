import type { MetadataRoute } from 'next';

import { copy } from '@/lib/copy';

/** Manifesto do app instalável (RF-15.1). Cores = tokens claros de src/styles/tokens.css (--bg, --accent). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.meta.title,
    short_name: copy.brand,
    description: copy.meta.description,
    start_url: '/',
    display: 'standalone',
    lang: 'pt-BR',
    background_color: '#eef0ec',
    theme_color: '#2c5a86',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
