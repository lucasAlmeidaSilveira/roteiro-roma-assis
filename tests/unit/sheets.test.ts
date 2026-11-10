// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { readSheetCsv, type Fetcher } from '@/server/sheets';

const URL = 'https://docs.google.com/spreadsheets/d/x/export?format=csv';

function response(body: string, status = 200, type = 'text/csv'): ReturnType<Fetcher> {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (n: string) => (n.toLowerCase() === 'content-type' ? type : null) },
    text: () => Promise.resolve(body),
  });
}

describe('readSheetCsv (planilha pelo export em CSV, D-16)', () => {
  it('sucesso: devolve as linhas do CSV', async () => {
    const csv = 'Carimbo de data/hora,Sua intenção ,Seu nome\n01/11/2026 09:00:00,Pela paz,Maria\n';
    expect(await readSheetCsv(URL, () => response(csv))).toEqual({
      ok: true,
      values: [
        ['Carimbo de data/hora', 'Sua intenção ', 'Seu nome'],
        ['01/11/2026 09:00:00', 'Pela paz', 'Maria'],
      ],
    });
  });

  it('planilha privada (login em HTML, 401, 403 ou 404) → forbidden', async () => {
    const html = '<html><body>Fazer login</body></html>';
    expect(await readSheetCsv(URL, () => response(html, 200, 'text/html; charset=utf-8'))).toEqual({
      ok: false,
      error: 'forbidden',
      status: 502,
    });
    for (const status of [401, 403, 404]) {
      expect(await readSheetCsv(URL, () => response('', status))).toMatchObject({
        ok: false,
        error: 'forbidden',
      });
    }
  });

  it('erro de rede ou 5xx → upstream, sem vazar detalhes', async () => {
    const r = await readSheetCsv(URL, () => Promise.reject(new Error('ECONNRESET segredo')));
    expect(r).toEqual({ ok: false, error: 'upstream', status: 502 });
    expect(JSON.stringify(r)).not.toContain('segredo');
    expect(await readSheetCsv(URL, () => response('', 500))).toMatchObject({ error: 'upstream' });
  });
});
