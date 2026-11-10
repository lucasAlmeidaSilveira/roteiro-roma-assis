'use client';

import { MapLink } from '@/components/ui/MapLink';
import ui from '@/components/ui/ui.module.css';
import { copy } from '@/lib/copy';
import type { Item } from '@/lib/schema';

import styles from './day.module.css';

export type ItemCardProps = {
  item: Item;
  done: boolean;
  isNow: boolean;
  onDone: (id: string, value: boolean) => void;
  onOpenPhrases: (item: Item, trigger: HTMLButtonElement) => void;
};

/** Cartão de um item do roteiro (RF-05). `li#it-{id}` é contrato dos testes. */
export function ItemCard({ item, done, isNow, onDone, onOpenPhrases }: ItemCardProps) {
  const classes = [styles.item];
  if (item.event) classes.push(styles.event);
  if (done) classes.push(styles.isDone);
  if (isNow) classes.push(styles.isNow);
  const checkboxId = `chk-${item.id}`;

  return (
    <li
      id={`it-${item.id}`}
      className={classes.join(' ')}
      aria-current={isNow ? 'time' : undefined}
    >
      <div className={styles.time}>{item.label}</div>
      <div>
        <p className={styles.place}>{item.place}</p>
        <p className={styles.action}>{item.action}</p>
        <div className={styles.row}>
          {item.event && <span className={styles.badge}>{copy.day.badge}</span>}
          {item.cost !== '—' && (
            <span className={item.paid ? `${ui.cost} ${ui.costPaid}` : ui.cost}>
              {item.paid ? copy.day.paidPrefix : ''}
              {item.cost}
            </span>
          )}
          {item.mapQuery && <MapLink query={item.mapQuery} />}
          <button
            type="button"
            className={styles.langBtn}
            aria-haspopup="dialog"
            onClick={(e) => onOpenPhrases(item, e.currentTarget)}
          >
            {copy.day.languages}{' '}
            <span className={styles.langTag} aria-hidden="true">
              {copy.day.languagesTag}
            </span>
          </button>
          <label className={styles.done} htmlFor={checkboxId}>
            <input
              type="checkbox"
              id={checkboxId}
              checked={done}
              onChange={(e) => onDone(item.id, e.target.checked)}
            />
            {copy.day.done}
          </label>
        </div>
      </div>
    </li>
  );
}
