import 'server-only';

import { JWT } from 'google-auth-library';

import type { GoogleEnv } from './env';

export type SheetsResult =
  { ok: true; values: unknown } | { ok: false; error: 'forbidden' | 'upstream'; status: 502 };

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

/** Código HTTP de um erro do gaxios/google-auth-library, sem depender do tipo exato. */
function httpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as { status?: unknown; response?: { status?: unknown } };
  if (typeof e.status === 'number') return e.status;
  if (typeof e.response?.status === 'number') return e.response.status;
  return undefined;
}

export type SheetsFetcher = (env: GoogleEnv) => Promise<unknown>;

/** Lê o intervalo da planilha com a conta de serviço (só leitura). */
export const fetchSheetValues: SheetsFetcher = async (env) => {
  const client = new JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY,
    scopes: SCOPES,
  });
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.INTENCOES_SHEET_ID)}` +
    `/values/${encodeURIComponent(env.INTENCOES_RANGE)}`;
  const res = await client.request<{ values?: unknown }>({ url });
  return res.data?.values ?? [];
};

/** Mapeia erros do Google para códigos estáveis, sem vazar detalhes (RF-12.3). */
export async function readSheet(env: GoogleEnv, fetcher: SheetsFetcher = fetchSheetValues) {
  try {
    return { ok: true, values: await fetcher(env) } satisfies SheetsResult;
  } catch (err) {
    const status = httpStatus(err);
    return {
      ok: false,
      error: status === 403 || status === 404 ? 'forbidden' : 'upstream',
      status: 502,
    } satisfies SheetsResult;
  }
}
