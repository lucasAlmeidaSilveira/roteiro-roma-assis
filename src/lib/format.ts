/** Preenche "{chave}" num modelo de texto. Chaves ausentes ficam como estão. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}

export function plural(n: number, one: string, other: string): string {
  return fill(n === 1 ? one : other, { n });
}

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'link'; value: string; href: string };

/**
 * Marcação mínima usada nos dados: **negrito** e [texto](https://url).
 * Não interpreta HTML (o React escapa o texto). Links só com http(s).
 */
export function parseInline(src: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  for (let m = re.exec(src); m !== null; m = re.exec(src)) {
    if (m.index > last) tokens.push({ type: 'text', value: src.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ type: 'strong', value: m[1] });
    else tokens.push({ type: 'link', value: m[2]!, href: m[3]! });
    last = re.lastIndex;
  }
  if (last < src.length) tokens.push({ type: 'text', value: src.slice(last) });
  return tokens;
}
