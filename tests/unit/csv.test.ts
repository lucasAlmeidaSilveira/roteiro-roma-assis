import { describe, expect, it } from 'vitest';

import { parseCsv, sheetCsvUrl, sheetIdFromUrl } from '@/lib/csv';

describe('parseCsv (export da planilha do Google)', () => {
  it('lê cabeçalho e linhas simples', () => {
    expect(parseCsv('a,b,c\n1,2,3\n')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('respeita aspas: vírgulas, quebras de linha e aspas duplicadas dentro do campo', () => {
    const csv =
      'Carimbo de data/hora,Sua intenção ,Seu nome\r\n' +
      '"01/11/2026 09:00:00","Pela paz, no mundo",Maria\r\n' +
      '02/11/2026 10:30:00,"Pela saúde da família\nem especial dos avós",\r\n' +
      '03/11/2026 18:45:00,"Ele disse ""obrigado""",João\r\n';
    expect(parseCsv(csv)).toEqual([
      ['Carimbo de data/hora', 'Sua intenção ', 'Seu nome'],
      ['01/11/2026 09:00:00', 'Pela paz, no mundo', 'Maria'],
      ['02/11/2026 10:30:00', 'Pela saúde da família\nem especial dos avós', ''],
      ['03/11/2026 18:45:00', 'Ele disse "obrigado"', 'João'],
    ]);
  });

  it('ignora BOM e linhas vazias; aceita arquivo sem quebra final', () => {
    expect(parseCsv('﻿a,b\n\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
    expect(parseCsv('')).toEqual([]);
  });
});

describe('links da planilha', () => {
  it('extrai o id do link e monta o export em CSV', () => {
    const url =
      'https://docs.google.com/spreadsheets/d/13s8YEO8NqSDPatk8zntatW9cW3YEZZZFeJmG5pqFaCY/edit';
    const id = sheetIdFromUrl(url);
    expect(id).toBe('13s8YEO8NqSDPatk8zntatW9cW3YEZZZFeJmG5pqFaCY');
    expect(sheetCsvUrl(id!)).toBe(
      'https://docs.google.com/spreadsheets/d/13s8YEO8NqSDPatk8zntatW9cW3YEZZZFeJmG5pqFaCY/export?format=csv',
    );
    expect(sheetCsvUrl(id!, '123')).toMatch(/&gid=123$/);
    expect(sheetIdFromUrl('https://forms.gle/abc')).toBeNull();
  });
});
