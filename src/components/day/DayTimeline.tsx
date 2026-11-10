'use client';

import { useState } from 'react';

import { PhrasesDialog, type OpenPhrases } from '@/components/phrases/PhrasesDialog';
import { useNow } from '@/hooks/use-now';
import { useDoneMap } from '@/hooks/use-stored';
import type { Item, PhraseSet } from '@/lib/schema';
import { nowNext, tripState } from '@/lib/time';

import { ItemCard } from './ItemCard';
import { NowCard } from './NowCard';
import styles from './day.module.css';

/**
 * Ilha cliente da página do dia (ARCHITECTURE §3.3): "Agora/Próximo", a linha do tempo e um único
 * popup de idiomas controlado. Nada que dependa de hora ou localStorage entra no HTML do servidor.
 */
export function DayTimeline({
  day,
  items,
  phraseSets,
}: {
  day: number;
  items: Item[];
  phraseSets: Record<string, PhraseSet>;
}) {
  const now = useNow();
  const { done, setDone } = useDoneMap();
  const [open, setOpen] = useState<OpenPhrases | null>(null);

  const state = now ? tripState(now) : null;
  const isToday = state !== null && state.day === day;
  const nn = isToday ? nowNext(items, state.minutes) : null;

  return (
    <>
      {state && nn && <NowCard items={items} state={state} nn={nn} />}
      <ol className={styles.timeline}>
        {items.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            done={Boolean(done[item.id])}
            isNow={nn !== null && nn.current === i}
            onDone={setDone}
            onOpenPhrases={(it, trigger) => {
              const set = phraseSets[it.phrases];
              if (set) setOpen({ set, place: it.place, trigger });
            }}
          />
        ))}
      </ol>
      <PhrasesDialog open={open} basic={phraseSets.basic} onClose={() => setOpen(null)} />
    </>
  );
}
