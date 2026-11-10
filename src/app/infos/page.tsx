import type { Metadata } from 'next';

import { Checklist } from '@/components/infos/Checklist';
import { DocSections } from '@/components/infos/DocSections';
import { KeyValueCard } from '@/components/infos/KeyValueCard';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { InlineText } from '@/components/ui/InlineText';
import { MapLink } from '@/components/ui/MapLink';
import { doc, eventProgram, infos, stays, todos } from '@/lib/content';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: `${infos.title} — ${copy.brand}` };

/** Infos práticas (RF-09) + conteúdo do documento (RF-13.3). */
export default function InfosPage() {
  return (
    <main className="wrap">
      <PageHeader eyebrow={infos.eyebrow} title={infos.title} />

      <Card title={infos.todoTitle}>
        <Checklist items={todos} />
      </Card>

      <Card title={infos.stays.title}>
        <ul>
          {infos.stays.items.map((s) => {
            const stay = s.stay ? stays[s.stay] : undefined;
            return (
              <li key={s.title}>
                <b>{s.title}</b>
                <br />
                <InlineText text={s.text} />
                {stay?.mapQuery && (
                  <>
                    {' '}
                    <MapLink query={stay.mapQuery} plain />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <KeyValueCard
        title={infos.transport.title}
        rows={infos.transport.rows}
        note={infos.transport.note}
      />
      <KeyValueCard title={infos.budget.title} rows={infos.budget.rows} />

      <Card title={infos.reminders.title}>
        <ul>
          {infos.reminders.items.map((r) => (
            <li key={r}>
              <InlineText text={r} />
            </li>
          ))}
        </ul>
      </Card>

      <DocSections doc={doc} event={eventProgram} />
    </main>
  );
}
