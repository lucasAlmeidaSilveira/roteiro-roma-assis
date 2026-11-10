import { MapLink } from '@/components/ui/MapLink';
import ui from '@/components/ui/ui.module.css';
import { copy } from '@/lib/copy';
import type { Stay } from '@/lib/schema';

import styles from './day.module.css';

/** "Onde dormir" (RF-03.8). */
export function StayBlock({ stay }: { stay: Stay }) {
  return (
    <div className={styles.sleep}>
      <div>
        <span className={ui.eyebrow}>{copy.day.sleep}</span>
        <b>{stay.name}</b>
        {stay.address}
        <br />
        <span className={styles.sleepWhen}>{stay.when}</span>
      </div>
      {stay.mapQuery && (
        <MapLink query={stay.mapQuery} className={`${ui.maplink} ${styles.sleepMap}`} />
      )}
    </div>
  );
}
