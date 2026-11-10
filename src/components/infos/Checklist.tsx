'use client';

import { useEffect } from 'react';

import { InlineText } from '@/components/ui/InlineText';
import ui from '@/components/ui/ui.module.css';
import { useDoneMap } from '@/hooks/use-stored';
import { STORAGE_KEYS, parseDone, readStorage } from '@/lib/storage';

export type ChecklistItem = { id: string; text: string; defaultDone?: boolean };

/**
 * Lista de caixas com marcação salva no aparelho (RF-06): pendências (todo-N) e decisões (decisao-N).
 *
 * As decisões que já vêm fechadas nos dados (`defaultDone`) são semeadas UMA vez no mapa de "Feito"
 * (o formato `{ id: 1 }` do site antigo não representa "desmarcado"); a chave `seedKey` marca que a
 * semeadura aconteceu, para o Lucas poder desmarcar e a escolha dele valer depois.
 */
export function Checklist({ items, seedKey }: { items: ChecklistItem[]; seedKey?: string }) {
  const { done, setDone } = useDoneMap();

  useEffect(() => {
    if (!seedKey) return;
    const current = parseDone(readStorage(STORAGE_KEYS.done));
    if (current[seedKey]) return;
    for (const it of items) if (it.defaultDone) setDone(it.id, true);
    setDone(seedKey, true);
  }, [items, seedKey, setDone]);

  return (
    <ul className={ui.check}>
      {items.map((it) => (
        <li key={it.id}>
          <label>
            <input
              type="checkbox"
              checked={Boolean(done[it.id])}
              onChange={(e) => setDone(it.id, e.target.checked)}
            />
            <span>
              <InlineText text={it.text} />
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
