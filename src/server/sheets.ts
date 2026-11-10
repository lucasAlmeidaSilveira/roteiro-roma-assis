import 'server-only';

import { parseCsv } from '@/lib/csv';

export type SheetsResult =
  { ok: true; values: string[][] } | { ok: false; error: 'forbidden' | 'upstream'; status: 502 };

export type Fetcher = (url: string) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

const defaultFetcher: Fetcher = (url) =>
  fetch(url, { cache: 'no-store', redirect: 'follow', headers: { Accept: 'text/csv' } });

/**
 * Lê a planilha pelo export em CSV (sem chave nem conta de serviço — D-16). Funciona quando ela está
 * compartilhada como "qualquer pessoa com o link pode ver". Planilha privada → o Google redireciona para
 * a tela de login (HTML) ou responde 401/403 → `forbidden`. Rede/outros → `upstream`.
 */
export async function readSheetCsv(
  url: string,
  fetcher: Fetcher = defaultFetcher,
): Promise<SheetsResult> {
  try {
    const res = await fetcher(url);
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return { ok: false, error: 'forbidden', status: 502 };
    }
    if (!res.ok) return { ok: false, error: 'upstream', status: 502 };
    const type = res.headers.get('content-type') ?? '';
    if (/text\/html/i.test(type)) return { ok: false, error: 'forbidden', status: 502 };
    return { ok: true, values: parseCsv(await res.text()) };
  } catch {
    return { ok: false, error: 'upstream', status: 502 };
  }
}
