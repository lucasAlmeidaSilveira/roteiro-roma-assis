/**
 * Leitor de CSV (RFC 4180) para o export da planilha do Google: campos entre aspas podem ter vírgulas,
 * quebras de linha e aspas duplicadas (""). Sem dependências. Linhas vazias no fim são ignoradas.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.startsWith('﻿') ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** ID da planilha a partir do link (…/spreadsheets/d/{id}/…), como no site antigo. */
export function sheetIdFromUrl(url: string): string | null {
  const m = /\/d\/([A-Za-z0-9_-]{20,})/.exec(url);
  return m ? m[1]! : null;
}

/** Link do export em CSV da planilha (precisa estar compartilhada como "qualquer pessoa com o link"). */
export function sheetCsvUrl(sheetId: string, gid?: string): string {
  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv`;
  return gid ? `${base}&gid=${encodeURIComponent(gid)}` : base;
}
