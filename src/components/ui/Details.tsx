import type { ReactNode } from 'react';

import styles from './ui.module.css';

/** Bloco recolhível para o conteúdo do documento (RF-13). Fechado por padrão. */
export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary>{summary}</summary>
      <div className={styles.detailsBody}>{children}</div>
    </details>
  );
}
