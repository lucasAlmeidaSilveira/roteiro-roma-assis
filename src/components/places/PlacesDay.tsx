import Link from 'next/link';

import { ExternalLink } from '@/components/ui/ExternalLink';
import { MapLink } from '@/components/ui/MapLink';
import ui from '@/components/ui/ui.module.css';
import { placesForDay } from '@/lib/places';
import type { Day, Ticket } from '@/lib/schema';

import styles from './places.module.css';

/** Um bloco por dia na aba Lugares (RF-08.2–8.3). */
export function PlacesDay({ day, tickets }: { day: Day; tickets: Ticket[] }) {
  const rows = placesForDay(day, tickets);
  return (
    <section className={`${ui.card} ${styles.section}`}>
      <h3>
        <Link href={`/dia/${day.day}`}>
          {day.weekday} {day.day} · {day.title}
        </Link>
      </h3>
      <ul className={styles.list}>
        {rows.map((r) => (
          <li key={r.place}>
            <span className={styles.place}>
              <span>
                {r.place}
                {r.paidCost && (
                  <>
                    {' '}
                    <span className={`${ui.cost} ${ui.costPaid}`}>{r.paidCost}</span>
                  </>
                )}
              </span>
              {r.ticket && (
                <span className={styles.ticket}>
                  <ExternalLink href={r.ticket.url} className={styles.ticketLink}>
                    {r.ticket.label} ↗
                  </ExternalLink>
                  <small>{r.ticket.note}</small>
                </span>
              )}
            </span>
            <MapLink query={r.mapQuery} className={styles.map} />
          </li>
        ))}
      </ul>
    </section>
  );
}
