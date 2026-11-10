import { STORAGE_KEYS, writeStorage } from './storage';

export type Theme = 'light' | 'dark';

/**
 * Script inline do <head> (roda antes da primeira pintura): aplica o tema salvo e evita o "flash".
 * Ver node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEYS.theme,
)});if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * Tema efetivo: só o atributo data-theme. Sem escolha salva, o padrão é o CLARO (decisão do Lucas,
 * docs/DECISIONS.md D-13); o sistema não é consultado.
 */
export function isDarkNow(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  writeStorage(STORAGE_KEYS.theme, theme);
}
