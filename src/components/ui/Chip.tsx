import type { ReactNode } from 'react';

import styles from './ui.module.css';

export function Chip({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return (
    <span className={strong ? `${styles.chip} ${styles.chipCity}` : styles.chip}>{children}</span>
  );
}
