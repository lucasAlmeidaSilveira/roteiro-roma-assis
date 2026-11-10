import { describe, expect, it } from 'vitest';

import { parseIntentionRows } from '@/lib/intentions';

const HEAD = ['Carimbo de data/hora', 'Sua intenção ', 'Seu nome'];

describe('parseIntentionRows', () => {
  it('sem respostas', () => {
    expect(parseIntentionRows(undefined).items).toEqual([]);
    expect(parseIntentionRows([HEAD]).items).toEqual([]);
    expect(parseIntentionRows('x').items).toEqual([]);
  });

  it('mais novas primeiro, com nome e data, ignorando vazias', () => {
    const r = parseIntentionRows([
      HEAD,
      ['01/11/2026 10:00:00', 'Pela família', 'Ana'],
      ['02/11/2026 11:00:00', '   ', 'Vazio'],
      ['03/11/2026 12:00:00', 'Pela saúde\nde todos', ''],
    ]);
    expect(r.items).toEqual([
      { text: 'Pela saúde\nde todos', timestamp: '03/11/2026 12:00:00' },
      { text: 'Pela família', name: 'Ana', timestamp: '01/11/2026 10:00:00' },
    ]);
  });

  it('linhas incompletas (a API omite células vazias no fim)', () => {
    const r = parseIntentionRows([HEAD, ['01/11/2026 10:00:00', 'Só a intenção']]);
    expect(r.items).toEqual([{ text: 'Só a intenção', timestamp: '01/11/2026 10:00:00' }]);
  });

  it('sem coluna "intenção": usa a última', () => {
    const r = parseIntentionRows([
      ['Quando', 'Pedido'],
      ['hoje', 'Por paz'],
    ]);
    expect(r.items).toEqual([{ text: 'Por paz' }]);
  });
});
