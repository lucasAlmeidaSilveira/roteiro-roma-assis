'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useNow } from '@/hooks/use-now';
import { copy } from '@/lib/copy';
import { fill } from '@/lib/format';
import { tripState } from '@/lib/time';

import styles from './shell.module.css';

export type DayChip = { day: number; weekday: string };

/** Chips dos 10 dias (RF-01.4): ativo pela rota, "hoje" pelo relógio de Roma, ativo rola para o centro. */
export function DayChips({ days }: { days: DayChip[] }) {
  const pathname = usePathname();
  const now = useNow();
  const navRef = useRef<HTMLElement>(null);

  const match = /^\/dia\/(\d+)$/.exec(pathname);
  const active = match ? Number(match[1]) : null;
  const today = now ? tripState(now).day : null;

  useEffect(() => {
    const cur = navRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    try {
      cur?.scrollIntoView({ block: 'nearest', inline: 'center' });
    } catch {
      /* navegadores antigos */
    }
  }, [active]);

  return (
    <nav ref={navRef} className={styles.days} aria-label={copy.nav.daysAria}>
      {days.map((d) => {
        const isToday = d.day === today;
        const name =
          fill(copy.day.chipAria, { weekday: d.weekday, day: d.day }) +
          (isToday ? copy.day.chipTodaySuffix : '');
        return (
          <Link
            key={d.day}
            href={`/dia/${d.day}`}
            aria-current={d.day === active ? 'true' : undefined}
            aria-label={name}
            className={isToday ? styles.today : undefined}
          >
            <span>{d.weekday}</span> <b>{d.day}</b>
          </Link>
        );
      })}
    </nav>
  );
}
