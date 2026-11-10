'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 15_000);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.clearInterval(id);
    document.removeEventListener('visibilitychange', onChange);
  };
}

const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => null;

/**
 * Minuto atual (epoch em minutos). null no servidor e durante a hidratação — por isso nada que
 * dependa da hora entra no HTML estático (evita erro de hidratação e o aviso de "current time"
 * do Next no prerender). Re-renderiza só quando o minuto muda.
 */
export function useNowMinute(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useNow(): Date | null {
  const minute = useNowMinute();
  return minute === null ? null : new Date(minute * 60_000);
}
