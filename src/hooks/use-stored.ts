'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { Lang } from '@/lib/schema';
import {
  STORAGE_KEYS,
  parseDone,
  readStorage,
  subscribeStorage,
  writeStorage,
  type DoneMap,
} from '@/lib/storage';

/** Valor do localStorage (null no servidor/hidratação), sincronizado entre componentes e abas. */
export function useStoredString(key: string): string | null {
  return useSyncExternalStore(
    subscribeStorage,
    () => readStorage(key),
    () => null,
  );
}

/** Itens marcados como "Feito" (roteiro, pendências e decisões) — só neste aparelho. */
export function useDoneMap(): { done: DoneMap; setDone: (id: string, value: boolean) => void } {
  const raw = useStoredString(STORAGE_KEYS.done);
  const done = useMemo(() => parseDone(raw), [raw]);
  const setDone = useCallback((id: string, value: boolean) => {
    const next = { ...parseDone(readStorage(STORAGE_KEYS.done)) };
    if (value) next[id] = 1;
    else delete next[id];
    writeStorage(STORAGE_KEYS.done, JSON.stringify(next));
  }, []);
  return { done, setDone };
}

/** Idioma das frases no popup ("it" padrão). */
export function useLang(): [Lang, (lang: Lang) => void] {
  const raw = useStoredString(STORAGE_KEYS.lang);
  const lang: Lang = raw === 'en' ? 'en' : 'it';
  const setLang = useCallback((l: Lang) => writeStorage(STORAGE_KEYS.lang, l), []);
  return [lang, setLang];
}
