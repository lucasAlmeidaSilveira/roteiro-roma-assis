import { PageHeader } from '@/components/shell/PageHeader';
import { Chip } from '@/components/ui/Chip';
import ui from '@/components/ui/ui.module.css';
import { phraseSetsForDay, stays } from '@/lib/content';
import { copy } from '@/lib/copy';
import { fill, plural } from '@/lib/format';
import type { Day } from '@/lib/schema';

import { Countdown } from './Countdown';
import { DayDetails } from './DayDetails';
import { DayTimeline } from './DayTimeline';
import { StayBlock } from './StayBlock';
import styles from './day.module.css';

/** Página do dia (RF-03): blocos na ordem do site antigo. */
export function DayView({ day }: { day: Day }) {
  const nEvents = day.items.filter((i) => i.event).length;
  const stay = stays[day.stay];
  return (
    <main className="wrap">
      <Countdown />
      <PageHeader
        eyebrow={fill(copy.day.eyebrow, { weekday: day.weekday, day: day.day })}
        title={day.title}
      >
        <p>{day.summary}</p>
        <div className={ui.meta}>
          <Chip strong>{day.city}</Chip>
          {nEvents > 0 && <Chip>{plural(nEvents, copy.day.eventsOne, copy.day.eventsOther)}</Chip>}
        </div>
      </PageHeader>
      {day.alert && (
        <div className={styles.alert}>
          <strong>{day.alert.title}</strong> {day.alert.body}
        </div>
      )}
      <DayTimeline day={day.day} items={day.items} phraseSets={phraseSetsForDay(day)} />
      {day.note && <p className={ui.note}>{day.note}</p>}
      {day.details && <DayDetails details={day.details} />}
      <StayBlock stay={stay} />
    </main>
  );
}
