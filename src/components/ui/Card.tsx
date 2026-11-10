import type { ReactNode } from 'react';

import styles from './ui.module.css';

/** Cartão genérico (DESIGN §4.8): <section> com h3. */
export function Card({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `${styles.card} ${className}` : styles.card}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
