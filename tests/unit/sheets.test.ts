// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type { GoogleEnv } from '@/server/env';
import { readSheet } from '@/server/sheets';

const env: GoogleEnv = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'leitor@exemplo.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
  INTENCOES_SHEET_ID: 'planilha-de-teste',
  INTENCOES_RANGE: 'A1:Z2000',
};

describe('readSheet: mapeamento de erros do Google (RF-12.3)', () => {
  it('sucesso devolve os valores', async () => {
    const values = [['Carimbo', 'Sua intenção', 'Nome']];
    expect(await readSheet(env, async () => values)).toEqual({ ok: true, values });
  });

  it('403/404 → forbidden (502)', async () => {
    const e403 = Object.assign(new Error('x'), { status: 403 });
    const e404 = Object.assign(new Error('x'), { response: { status: 404 } });
    expect(await readSheet(env, () => Promise.reject(e403))).toEqual({
      ok: false,
      error: 'forbidden',
      status: 502,
    });
    expect(await readSheet(env, () => Promise.reject(e404))).toEqual({
      ok: false,
      error: 'forbidden',
      status: 502,
    });
  });

  it('qualquer outro erro → upstream (502), sem vazar detalhes', async () => {
    const r = await readSheet(env, () => Promise.reject(new Error('chave inválida: segredo')));
    expect(r).toEqual({ ok: false, error: 'upstream', status: 502 });
    expect(JSON.stringify(r)).not.toContain('segredo');
  });
});
