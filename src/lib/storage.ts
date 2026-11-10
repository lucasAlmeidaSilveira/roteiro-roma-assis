/**
 * Preferências guardadas só neste aparelho (mesmas chaves do site antigo).
 * Toda leitura/escrita é protegida: navegação privada ou bloqueio de cookies não pode quebrar a página;
 * nesse caso o valor fica em memória até fechar a aba.
 */
export const STORAGE_KEYS = {
  /** mapa { "14-0": 1, "todo-3": 1, "decisao-2": 1 } */
  done: 'roteiro-roma-feitos-v1',
  /** "light" | "dark" (ausente = segue o sistema) */
  theme: 'roteiro-roma-tema',
  /** "it" | "en" */
  lang: 'roteiro-roma-idioma',
} as const;

const memory = new Map<string, string>();
const listeners = new Set<() => void>();

export function readStorage(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    return v ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function writeStorage(key: string, value: string | null): void {
  if (value === null) memory.delete(key);
  else memory.set(key, value);
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* fica só em memória */
  }
  listeners.forEach((l) => l());
}

export function subscribeStorage(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

export type DoneMap = Record<string, 1>;

export function parseDone(raw: string | null): DoneMap {
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .filter(([, x]) => Boolean(x))
        .map(([k]) => [k, 1 as const]),
    );
  } catch {
    return {};
  }
}
