import { STORAGE_KEYS, writeStorage } from './storage';

export type Theme = 'light' | 'dark';

/**
 * Script inline do <head> (roda antes da primeira pintura): aplica o tema salvo e evita o "flash".
 * Ver node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEYS.theme,
)});if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/** Tema efetivo: o atributo data-theme, ou a preferência do sistema quando não há escolha salva. */
export function isDarkNow(): boolean {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  writeStorage(STORAGE_KEYS.theme, theme);
}
