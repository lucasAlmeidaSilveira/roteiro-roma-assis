'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';

import { copy } from '@/lib/copy';
import { STORAGE_KEYS, readStorage, subscribeStorage } from '@/lib/storage';
import { applyTheme, isDarkNow } from '@/lib/theme';

import styles from './shell.module.css';

const getServerSnapshot = () => null;

/** Chave claro/escuro (RF-02). Padrão claro; o estado efetivo vem do DOM (null até hidratar). */
export function ThemeSwitch() {
  const dark = useSyncExternalStore(subscribeStorage, isDarkNow, getServerSnapshot);

  // Em desenvolvimento o Strict Mode limpa o atributo que o script inline pôs no <html>;
  // reaplica antes da pintura (no-op em produção). Ver guia "preventing-flash-before-hydration".
  useLayoutEffect(() => {
    const saved = readStorage(STORAGE_KEYS.theme);
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const checked = dark === true;
  return (
    <button
      type="button"
      className={styles.theme}
      role="switch"
      aria-checked={checked}
      aria-label={copy.theme.aria}
      onClick={() => applyTheme(isDarkNow() ? 'light' : 'dark')}
    >
      <span>{checked ? copy.theme.dark : copy.theme.light}</span>
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </button>
  );
}
