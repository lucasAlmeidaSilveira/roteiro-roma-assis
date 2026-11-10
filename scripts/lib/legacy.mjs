// Lê as constantes de dados do site legado (legacy/site.html) sem executar o DOM.
// Usado por scripts/check-parity.mjs para provar que src/data contém tudo.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export function loadLegacy(htmlPath) {
  const html = readFileSync(htmlPath, 'utf8');
  const lines = html.split('\n');
  const start = lines.findIndex((l) => l.startsWith('const MAP'));
  const end = lines.findIndex((l) => l.startsWith('Object.keys(TICKETS)'));
  if (start < 0 || end < 0) throw new Error('Não achei o bloco de dados em ' + htmlPath);
  const code =
    lines.slice(start, end + 1).join('\n') +
    '\n;globalThis.__out = {STAY, DAYS, TODO_INFO, PH, PH_EN, PHMAP, TICKETS};';
  const ctx = { encodeURIComponent };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const out = JSON.parse(JSON.stringify(ctx.__out));
  const intentLine = lines.find((l) => l.startsWith('const INTENT'));
  out.INTENT = vm.runInNewContext(
    '(' + intentLine.replace(/^const INTENT = /, '').replace(/;\s*$/, '') + ')',
  );
  // Textos fixos que estão dentro de templates HTML (Infos, Lugares, Intenções, rodapé, popup)
  out.TEMPLATE_TEXT = templateText(html);
  return out;
}

/** Texto visível (sem tags) de trechos estáticos do HTML/JS legado, para conferir cópia literal. */
function templateText(html) {
  const pick = (startMarker, endMarker) => {
    const i = html.indexOf(startMarker);
    const j = html.indexOf(endMarker, i + startMarker.length);
    if (i < 0 || j < 0) throw new Error('Marcador não encontrado: ' + startMarker);
    return html.slice(i, j);
  };
  const strip = (s) =>
    s
      .replace(/\$\{[^}]*\}/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  return {
    infos: strip(pick('function renderInfos(){', 'function route(){')),
    places: strip(pick('function renderPlaces(){', 'function renderIntencoes(){')),
    intencoes: strip(pick('function renderIntencoes(){', '/* ---------- leitura da planilha')),
    body: strip(pick('<header class="top">', '<script>')),
    day: strip(pick('function renderDay(d){', 'function renderPlaces(){')),
    now: strip(pick('function nowCard(D, ts){', 'function renderDay(d){')),
  };
}
