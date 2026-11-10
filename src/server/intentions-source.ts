import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseIntentionRows, type Intention } from '@/lib/intentions';

import { getGoogleEnv, isFixtureMode } from './env';
import { readSheet } from './sheets';

export type LoadResult =
  | { ok: true; items: Intention[] }
  | { ok: false; error: 'not_configured'; status: 503 }
  | { ok: false; error: 'forbidden' | 'upstream'; status: 502 };

const FIXTURE = path.join(process.cwd(), 'tests', 'fixtures', 'intencoes.json');

/** Fonte das intenções: fixture (só testes, fora da Vercel) ou a planilha do Google. */
export async function loadIntentions(): Promise<LoadResult> {
  if (isFixtureMode()) {
    const raw: unknown = JSON.parse(await readFile(FIXTURE, 'utf8'));
    const values =
      raw && typeof raw === 'object' ? (raw as { values?: unknown }).values : undefined;
    return { ok: true, items: parseIntentionRows(values).items };
  }
  const env = getGoogleEnv();
  if (!env) return { ok: false, error: 'not_configured', status: 503 };
  const sheet = await readSheet(env);
  if (!sheet.ok) return sheet;
  return { ok: true, items: parseIntentionRows(sheet.values).items };
}
