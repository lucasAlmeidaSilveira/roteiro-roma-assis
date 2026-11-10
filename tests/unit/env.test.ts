// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';

import { isFixtureMode, sheetGid } from '@/server/env';

const KEYS = ['INTENCOES_FIXTURE', 'INTENCOES_GID', 'VERCEL'] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('variáveis de ambiente (todas opcionais, lidas sob demanda)', () => {
  it('modo fixture só com INTENCOES_FIXTURE=1 e fora da Vercel', () => {
    for (const k of KEYS) delete process.env[k];
    expect(isFixtureMode()).toBe(false);
    process.env.INTENCOES_FIXTURE = '1';
    expect(isFixtureMode()).toBe(true);
    process.env.VERCEL = '1';
    expect(isFixtureMode()).toBe(false);
  });

  it('INTENCOES_GID só vale quando é um número', () => {
    delete process.env.INTENCOES_GID;
    expect(sheetGid()).toBeUndefined();
    process.env.INTENCOES_GID = ' 123456 ';
    expect(sheetGid()).toBe('123456');
    process.env.INTENCOES_GID = 'abc';
    expect(sheetGid()).toBeUndefined();
  });
});
