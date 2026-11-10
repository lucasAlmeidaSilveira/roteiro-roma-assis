import { Fragment } from 'react';

import { Card } from '@/components/ui/Card';
import ui from '@/components/ui/ui.module.css';

/** Tabela chave/valor (Transporte, Orçamento) — DESIGN §4.8: valor à direita, em negrito. */
export function KeyValueCard({
  title,
  rows,
  note,
}: {
  title: string;
  rows: { label: string; value: string }[];
  note?: string;
}) {
  return (
    <Card title={title}>
      <KeyValueGrid rows={rows} />
      {note && <p className={`${ui.note} ${ui.cardNote}`}>{note}</p>}
    </Card>
  );
}

/** Grade `minmax(0,1fr) auto`: label e valor precisam ser filhos diretos (nth-child(even) = valor). */
export function KeyValueGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className={ui.kv}>
      {rows.map((r) => (
        <Fragment key={r.label}>
          <div>{r.label}</div>
          <div>{r.value}</div>
        </Fragment>
      ))}
    </div>
  );
}
