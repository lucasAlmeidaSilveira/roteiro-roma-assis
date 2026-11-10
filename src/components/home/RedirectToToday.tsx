'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useNow } from '@/hooks/use-now';
import { copy } from '@/lib/copy';
import { fill } from '@/lib/format';
import { TRIP, tripState } from '@/lib/time';

import ui from '@/components/ui/ui.module.css';

/** Calcula o dia de hoje no cliente e troca a rota; sem JS, ficam os links para os 10 dias. */
export function RedirectToToday({ days }: { days: { day: number; weekday: string }[] }) {
  const router = useRouter();
  const now = useNow();

  useEffect(() => {
    if (now) router.replace(`/dia/${tripState(now).day ?? TRIP.firstDay}`);
  }, [now, router]);

  return (
    <div className={ui.dayhead}>
      <p>{copy.home.opening}</p>
      <p>{copy.home.chooseDay}</p>
      <ul>
        {days.map((d) => (
          <li key={d.day}>
            <Link href={`/dia/${d.day}`}>
              {fill(copy.day.chipAria, { weekday: d.weekday, day: d.day })}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
