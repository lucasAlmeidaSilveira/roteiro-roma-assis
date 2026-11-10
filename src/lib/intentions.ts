/** Interpretação das linhas da planilha de respostas do Google Forms (cabeçalho na 1ª linha). */
export type Intention = { text: string; name?: string; timestamp?: string };
export type IntentionsResult = { items: Intention[] };

const cell = (row: readonly unknown[], i: number): string =>
  i >= 0 && row[i] != null ? String(row[i]).trim() : '';

/**
 * - Coluna da intenção: cabeçalho com "inten…" (senão, a última coluna).
 * - Nome: "nome"/"name". Data: "carimbo"/"timestamp"/"data"/"hora".
 * - Ignora linhas com intenção vazia; as mais novas primeiro (ordem inversa da planilha).
 * - Sem respostas (só cabeçalho ou nada) → items vazio.
 */
export function parseIntentionRows(values: unknown): IntentionsResult {
  if (!Array.isArray(values) || values.length < 2 || !values.every(Array.isArray)) {
    return { items: [] };
  }
  const rows = values as unknown[][];
  const head = rows[0]!.map((h) => String(h ?? ''));
  let iInt = head.findIndex((h) => /inten/i.test(h));
  if (iInt < 0) iInt = head.length - 1;
  const iName = head.findIndex((h) => /nome|name/i.test(h));
  const iTs = head.findIndex((h) => /carimbo|timestamp|data|hora/i.test(h));
  const items = rows
    .slice(1)
    .filter((r) => cell(r, iInt))
    .reverse()
    .map((r) => {
      const item: Intention = { text: cell(r, iInt) };
      const name = cell(r, iName);
      const ts = cell(r, iTs);
      if (name) item.name = name;
      if (ts) item.timestamp = ts;
      return item;
    });
  return { items };
}
