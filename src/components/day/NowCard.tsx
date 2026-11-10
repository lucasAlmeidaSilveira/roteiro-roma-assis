import { copy } from '@/lib/copy';
import { fill } from '@/lib/format';
import type { Item } from '@/lib/schema';
import { formatClock, formatDuration, type NowNext, type TripState } from '@/lib/time';

import styles from './day.module.css';

/** Cartão "Agora / Próximo" (RF-04). Recebe o estado já calculado pelo DayTimeline (cliente). */
export function NowCard({ items, state, nn }: { items: Item[]; state: TripState; nn: NowNext }) {
  const current = nn.current >= 0 ? items[nn.current] : undefined;
  const next = nn.next >= 0 ? items[nn.next] : undefined;
  return (
    <div className={styles.now} role="status">
      <span className={styles.nowLabel}>
        {fill(copy.now.label, { hh: state.rome.hh, mm: state.rome.mm })}
      </span>
      {current && (
        <>
          <span className={styles.nowWhat}>{fill(copy.now.current, { place: current.place })}</span>
          <span className={styles.nowSub}>{current.action}</span>
        </>
      )}
      {next && nn.nextAt !== null && nn.untilNext !== null ? (
        <span className={styles.nowSub}>
          <b>{copy.now.nextLabel}</b>{' '}
          {fill(copy.now.next, {
            place: next.place,
            time: formatClock(nn.nextAt),
            duration: formatDuration(nn.untilNext),
          })}
        </span>
      ) : (
        <span className={styles.nowSub}>{copy.now.nothingMore}</span>
      )}
    </div>
  );
}
