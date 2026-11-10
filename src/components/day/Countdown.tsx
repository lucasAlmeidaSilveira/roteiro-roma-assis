'use client';

import { useNow } from '@/hooks/use-now';
import { copy } from '@/lib/copy';
import { plural } from '@/lib/format';
import { daysUntilTrip, tripState } from '@/lib/time';

import ui from '@/components/ui/ui.module.css';

/** Contagem regressiva antes da viagem (RF-03.1). Só no cliente. */
export function Countdown() {
  const now = useNow();
  if (!now || tripState(now).day !== null) return null;
  const n = daysUntilTrip(now);
  if (n <= 0) return null;
  return <p className={ui.note}>{plural(n, copy.day.countdownOne, copy.day.countdownOther)}</p>;
}
