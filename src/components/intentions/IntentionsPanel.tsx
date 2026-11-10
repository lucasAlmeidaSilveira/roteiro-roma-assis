'use client';

import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import ui from '@/components/ui/ui.module.css';
import { copy } from '@/lib/copy';
import { fill, plural } from '@/lib/format';
import type { Intention } from '@/lib/intentions';

import { MessageCard } from './MessageCard';
import styles from './intentions.module.css';

type Panel =
  | { kind: 'loading' }
  | { kind: 'list'; items: Intention[]; updatedAt: Date }
  | { kind: 'error'; message: string };

const API = '/api/intencoes';

function errorMessage(status: number, code: string | undefined): string {
  if (code === 'not_configured' || status === 503) return copy.intentions.notConfigured;
  if (code === 'forbidden' || status === 403) return copy.intentions.forbidden;
  return fill(copy.intentions.error, { code: code ?? String(status) });
}

async function readError(res: Response): Promise<string | undefined> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && 'error' in body) {
      const e = (body as { error: unknown }).error;
      return typeof e === 'string' ? e : undefined;
    }
  } catch {
    /* sem corpo */
  }
  return undefined;
}

function isIntention(x: unknown): x is Intention {
  return Boolean(x) && typeof x === 'object' && typeof (x as { text: unknown }).text === 'string';
}

/** GET /api/intencoes → próximo estado do painel (função pura em relação ao React). */
async function fetchPanel(): Promise<Panel> {
  try {
    const res = await fetch(API, { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return { kind: 'error', message: errorMessage(res.status, await readError(res)) };
    const body: unknown = await res.json();
    const raw = body && typeof body === 'object' ? (body as { items?: unknown }).items : undefined;
    const items = Array.isArray(raw) ? raw.filter(isIntention) : [];
    return { kind: 'list', items, updatedAt: new Date() };
  } catch {
    return { kind: 'error', message: fill(copy.intentions.error, { code: 'rede' }) };
  }
}

/** Interface das intenções (RF-10): busca a API ao abrir e ao tocar "Atualizar". Aberta a todos (D-15). */
export function IntentionsPanel({ message }: { message: string }) {
  const [panel, setPanel] = useState<Panel>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    fetchPanel().then((next) => {
      if (alive) setPanel(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function refresh() {
    // Como no site antigo: "Carregando…" sempre que alguém toca em Atualizar.
    setPanel({ kind: 'loading' });
    setPanel(await fetchPanel());
  }

  const items = panel.kind === 'list' ? panel.items : [];
  const title =
    panel.kind === 'list' && items.length > 0
      ? plural(items.length, copy.intentions.countOne, copy.intentions.countOther)
      : copy.intentions.listTitle;

  let status = '';
  let statusClass = `${ui.status} ${ui.statusMuted}`;
  if (panel.kind === 'loading') status = copy.intentions.loading;
  else if (panel.kind === 'error') {
    status = panel.message;
    statusClass = `${ui.status} ${ui.statusWarn}`;
  } else {
    status =
      items.length === 0
        ? copy.intentions.empty
        : fill(copy.intentions.updated, {
            time: panel.updatedAt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
  }

  return (
    <>
      <PageHeader eyebrow={copy.intentions.eyebrow} title={copy.intentions.title}>
        <p>{copy.intentions.lead}</p>
      </PageHeader>

      <Card title={title}>
        <p className={statusClass} role="status">
          {status}
        </p>
        {items.length > 0 && (
          <ol className={styles.list} tabIndex={0} aria-label={title}>
            {items.map((it, i) => {
              const meta = [it.name, it.timestamp].filter(Boolean).join(' · ');
              return (
                <li key={`${i}-${it.timestamp ?? ''}`}>
                  <p className={styles.text}>{it.text}</p>
                  {meta && <p className={styles.meta}>{meta}</p>}
                </li>
              );
            })}
          </ol>
        )}
        <div className={ui.btns}>
          <button
            type="button"
            className={`${ui.btn} ${ui.btnPrimary}`}
            onClick={() => void refresh()}
          >
            {copy.intentions.refresh}
          </button>
        </div>
      </Card>

      <MessageCard message={message} />
    </>
  );
}
