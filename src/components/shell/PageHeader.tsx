import type { ReactNode } from 'react';

import ui from '@/components/ui/ui.module.css';

/** Cabeçalho de página: eyebrow + h2 + parágrafo opcional (DESIGN §4.5). Sem dependências de servidor. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={ui.dayhead}>
      <div className={ui.eyebrow}>{eyebrow}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
