import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { intentionsConfig } from '@/lib/content';
import { sheetCsvUrl, sheetIdFromUrl } from '@/lib/csv';
import { parseIntentionRows, type Intention } from '@/lib/intentions';

import { isFixtureMode, sheetGid } from './env';
import { readSheetCsv } from './sheets';

export type LoadResult =
  | { ok: true; items: Intention[] }
  | { ok: false; error: 'not_configured'; status: 503 }
  | { ok: false; error: 'forbidden' | 'upstream'; status: 502 };

const FIXTURE = path.join(process.cwd(), 'tests', 'fixtures', 'intencoes.json');

/** Fonte das intenções: fixture (só testes, fora da Vercel) ou o CSV da planilha (link em intentions.json). */
export async function loadIntentions(): Promise<LoadResult> {
  if (isFixtureMode()) {
    const raw: unknown = JSON.parse(await readFile(FIXTURE, 'utf8'));
    const values =
      raw && typeof raw === 'object' ? (raw as { values?: unknown }).values : undefined;
    return { ok: true, items: parseIntentionRows(values).items };
  }
  const id = sheetIdFromUrl(intentionsConfig.sheetUrl);
  if (!id) return { ok: false, error: 'not_configured', status: 503 };
  const sheet = await readSheetCsv(sheetCsvUrl(id, sheetGid()));
  if (!sheet.ok) return sheet;
  return { ok: true, items: parseIntentionRows(sheet.values).items };
}
