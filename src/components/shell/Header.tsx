import { days } from '@/lib/content';
import { copy } from '@/lib/copy';

import { DayChips } from './DayChips';
import { ThemeSwitch } from './ThemeSwitch';
import styles from './shell.module.css';

/** Cabeçalho fixo (RF-01.1–1.4): marca + data + tema e chips dos dias. As seções ficam na barra do rodapé (D-14). */
export function Header() {
  const chips = days.map((d) => ({ day: d.day, weekday: d.weekday }));
  return (
    <header className={styles.header}>
      <div className="wrap">
        <div className={styles.brand}>
          <h1>{copy.brand}</h1>
          <div className={styles.brandRight}>
            <small className={styles.date}>{copy.dateRange}</small>
            <ThemeSwitch />
          </div>
        </div>
        <DayChips days={chips} />
      </div>
    </header>
  );
}
