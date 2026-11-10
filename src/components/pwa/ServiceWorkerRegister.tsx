'use client';

import { useEffect } from 'react';

/** Registra o service worker (public/sw.js) só em produção (RF-15.3). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* sem offline: o app continua funcionando com internet */
    });
  }, []);
  return null;
}
