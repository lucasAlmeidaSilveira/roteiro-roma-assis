// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';

import { getGoogleEnv, isFixtureMode } from '@/server/env';

const KEYS = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'INTENCOES_SHEET_ID',
  'INTENCOES_RANGE',
  'INTENCOES_FIXTURE',
  'VERCEL',
] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('variáveis de ambiente (validadas sob demanda)', () => {
  it('ausentes → null (o build e as páginas estáticas não dependem delas)', () => {
    for (const k of KEYS) delete process.env[k];
    expect(getGoogleEnv()).toBeNull();
    expect(isFixtureMode()).toBe(false);
  });

  it('GOOGLE_PRIVATE_KEY troca \\n literal por quebra de linha; INTENCOES_RANGE tem padrão', () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'robo@exemplo.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY =
      '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n';
    process.env.INTENCOES_SHEET_ID = 'id';
    delete process.env.INTENCOES_RANGE;
    const g = getGoogleEnv();
    expect(g?.GOOGLE_PRIVATE_KEY).toBe(
      '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
    );
    expect(g?.INTENCOES_RANGE).toBe('A1:Z2000');
    process.env.INTENCOES_RANGE = "'Respostas ao formulário 1'!A1:C500";
    expect(getGoogleEnv()?.INTENCOES_RANGE).toBe("'Respostas ao formulário 1'!A1:C500");
  });

  it('modo fixture só com INTENCOES_FIXTURE=1 e fora da Vercel', () => {
    process.env.INTENCOES_FIXTURE = '1';
    delete process.env.VERCEL;
    expect(isFixtureMode()).toBe(true);
    process.env.VERCEL = '1';
    expect(isFixtureMode()).toBe(false);
  });
});
