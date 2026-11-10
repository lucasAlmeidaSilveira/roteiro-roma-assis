import 'server-only';

/**
 * Nenhuma variável é obrigatória (D-16): a planilha é lida pelo link que está em src/data/intentions.json.
 * Tudo aqui é lido sob demanda (nunca no import): o build e as páginas estáticas não dependem de nada.
 */

/** Modo de teste: lê tests/fixtures/intencoes.json. Nunca vale na Vercel. */
export function isFixtureMode(): boolean {
  return process.env.INTENCOES_FIXTURE === '1' && process.env.VERCEL !== '1';
}

/** Opcional: gid da aba de respostas, se não for a primeira aba da planilha. */
export function sheetGid(): string | undefined {
  const gid = process.env.INTENCOES_GID?.trim();
  return gid && /^\d+$/.test(gid) ? gid : undefined;
}
