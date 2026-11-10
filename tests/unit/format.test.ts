import { describe, expect, it } from 'vitest';

import { fill, parseInline, plural } from '@/lib/format';

describe('fill / plural', () => {
  it('preenche chaves', () => {
    expect(fill('{weekday} · {day} de novembro', { weekday: 'Sáb', day: 14 })).toBe(
      'Sáb · 14 de novembro',
    );
    expect(fill('{a} {b}', { a: 1 })).toBe('1 {b}');
  });
  it('plural', () => {
    expect(plural(1, '{n} dia', '{n} dias')).toBe('1 dia');
    expect(plural(4, '{n} dia', '{n} dias')).toBe('4 dias');
    expect(plural(0, '{n} dia', '{n} dias')).toBe('0 dias');
  });
});

describe('parseInline', () => {
  it('texto puro', () => {
    expect(parseInline('só texto')).toEqual([{ type: 'text', value: 'só texto' }]);
  });
  it('negrito e link', () => {
    expect(parseInline('Emergência: **112**. Veja [o site](https://x.it/a?b=1).')).toEqual([
      { type: 'text', value: 'Emergência: ' },
      { type: 'strong', value: '112' },
      { type: 'text', value: '. Veja ' },
      { type: 'link', value: 'o site', href: 'https://x.it/a?b=1' },
      { type: 'text', value: '.' },
    ]);
  });
  it('não aceita link sem http(s) nem HTML', () => {
    expect(parseInline('[x](javascript:alert(1)) <b>oi</b>')).toEqual([
      { type: 'text', value: '[x](javascript:alert(1)) <b>oi</b>' },
    ]);
  });
});
