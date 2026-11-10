#!/usr/bin/env node
/**
 * Prova de paridade de CONTEÚDO: tudo o que existe no site antigo (legacy/site.html) e no
 * documento (legacy/roteiro-doc.md) precisa existir em src/data. Sai com código 1 se faltar algo.
 * (A paridade de COMPORTAMENTO é provada pelos testes em tests/e2e, que rodam nos dois sites.)
 */
import { readFileSync } from 'node:fs';

import { loadLegacy } from './lib/legacy.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const L = loadLegacy(new URL('legacy/site.html', root));
const md = readFileSync(new URL('legacy/roteiro-doc.md', root), 'utf8');

const days = read('src/data/days.json');
const stays = read('src/data/stays.json');
const phrases = read('src/data/phrases.json');
const tickets = read('src/data/tickets.json');
const todo = read('src/data/todo.json');
const infos = read('src/data/infos.json');
const ui = read('src/data/ui.json');
const intentions = read('src/data/intentions.json');
const doc = read('src/data/doc.json');

const problems = [];
const excused = [];
const exceptions = read('scripts/parity-exceptions.json').excecoes ?? [];
const check = (ok, msg) => {
  if (ok) return;
  const ex = exceptions.find((e) => msg.startsWith(e.alvo));
  if (ex) excused.push(`${msg} — ${ex.motivo}`);
  else problems.push(msg);
};
const norm = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const mergeLinks = (t) => {
  let prev;
  do {
    prev = t;
    t = t.replace(/\[([^\]]*)\]\(([^)]+)\)\[([^\]]*)\]\(\2\)/g, '[$1$3]($2)');
  } while (t !== prev);
  return t;
};
const mdText = norm(mergeLinks(md).replace(/\\\|/g, '|'));
let compared = 0;

// ---------- dias e itens ----------
check(days.length === L.DAYS.length, `dias: ${days.length} ≠ ${L.DAYS.length}`);
for (const D of L.DAYS) {
  const d = days.find((x) => x.day === D.d);
  if (!d) {
    check(false, `dia ${D.d} ausente`);
    continue;
  }
  for (const [k, v] of [
    ['weekday', D.wd],
    ['title', D.title],
    ['city', D.city],
    ['stay', D.stay],
    ['summary', D.sum],
    ['note', D.note],
  ]) {
    check(d[k] === v, `dia ${D.d}: ${k} diferente`);
    compared++;
  }
  if (D.alert) {
    check(
      d.alert && `<strong>${d.alert.title}</strong> ${d.alert.body}` === D.alert,
      `dia ${D.d}: alerta diferente`,
    );
    compared++;
  }
  check(
    d.items.length === D.items.length,
    `dia ${D.d}: ${d.items.length} itens ≠ ${D.items.length}`,
  );
  D.items.forEach((it, i) => {
    const n = d.items[i];
    const id = `${D.d}-${i}`;
    if (!n) return check(false, `item ${id} ausente`);
    const pairs = [
      ['id', id, n.id],
      ['start', it.t ?? null, n.start],
      ['nextDay', it.nd ? true : undefined, n.nextDay],
      ['label', it.label, n.label],
      ['place', it.p, n.place],
      ['action', it.a, n.action],
      ['cost', it.c, n.cost],
      ['mapQuery', it.q, n.mapQuery],
      ['event', it.ev ? true : undefined, n.event],
      ['paid', it.paid ? true : undefined, n.paid],
      ['phrases', L.PHMAP[id], n.phrases],
    ];
    for (const [k, a, b] of pairs) {
      check(
        a === b,
        `item ${id}: ${k} diferente (antigo: ${JSON.stringify(a)} / novo: ${JSON.stringify(b)})`,
      );
      compared++;
    }
  });
}

// ---------- hospedagens, frases, ingressos, pendências ----------
for (const [k, s] of Object.entries(L.STAY)) {
  const n = stays[k];
  check(
    n && n.name === s.name && n.address === s.addr && n.mapQuery === s.q && n.when === s.when,
    `hospedagem ${k} diferente`,
  );
  compared++;
}
for (const [k, s] of Object.entries(L.PH)) {
  const n = phrases[k];
  if (!n) {
    check(false, `frases ${k} ausentes`);
    continue;
  }
  check(n.title === s.t, `frases ${k}: título diferente`);
  for (const [lang, src] of [
    ['it', s.ph],
    ['en', L.PH_EN[k].ph],
  ]) {
    check(n[lang].length === src.length, `frases ${k}/${lang}: ${n[lang].length} ≠ ${src.length}`);
    src.forEach(([text, pron, pt], i) => {
      const p = n[lang][i];
      check(
        p && p.text === text && p.pron === pron && p.pt === pt,
        `frase ${k}/${lang}/${i} diferente`,
      );
      compared++;
    });
  }
}
for (const [place, t] of Object.entries(L.TICKETS)) {
  const n = tickets.find((x) => x.place === place);
  check(
    n && n.url === t.url && n.label === t.label && n.note === t.note,
    `ingresso "${place}" diferente`,
  );
  compared++;
}
check(todo.length === L.TODO_INFO.length, 'pendências: quantidade diferente');
L.TODO_INFO.forEach((t, i) => {
  check(todo[i]?.text === t && todo[i]?.id === `todo-${i}`, `pendência ${i} diferente`);
  compared++;
});
check(intentions.formUrl === L.INTENT.form, 'link do formulário diferente');

// ---------- textos fixos dentro dos templates do site antigo ----------
const T = L.TEMPLATE_TEXT;
const raw = readFileSync(new URL('legacy/site.html', root), 'utf8');
// Compara ignorando espaços (as tags removidas dos templates deixam espaços extras)
const squash = (s) => norm(s).replace(/\s+/g, '');
const inText = (hay, s, where) => {
  check(squash(hay).includes(squash(s)), `texto ausente (${where}): "${s.slice(0, 70)}…"`);
  compared++;
};
const inRaw = (s) => {
  check(raw.includes(s), `texto ausente no código do site antigo: "${s}"`);
  compared++;
};
inText(T.infos, infos.title, 'Infos');
inText(T.infos, infos.todoTitle, 'Infos');
for (const s of infos.stays.items) {
  inText(T.infos, s.title, 'Infos');
  inText(T.infos, s.text, 'Infos');
}
for (const c of [infos.transport, infos.budget]) {
  inText(T.infos, c.title, 'Infos');
  for (const r of c.rows) {
    inText(T.infos, r.label, 'Infos');
    inText(T.infos, r.value, 'Infos');
  }
}
inText(T.infos, infos.transport.note, 'Infos');
for (const r of infos.reminders.items) inText(T.infos, r, 'Infos');
inText(T.places, ui.places.intro, 'Lugares');
inText(T.places, ui.places.title, 'Lugares');
for (const w of intentions.where) inText(T.intencoes, w, 'Intenções');
for (const s of [
  ui.brand,
  ui.dateRange,
  ui.footer,
  ui.phrases.tip,
  ui.phrases.always,
  ui.nav.days,
  ui.nav.places,
  ui.nav.intentions,
  ui.nav.infos,
])
  inText(T.body, s, 'cabeçalho/rodapé/popup');
for (const s of [
  'Onde dormir',
  "'compromisso':'compromissos'} da Convenção",
  'A viagem começa em ${before}',
  'Abra esta página em Roma para ver o que está acontecendo agora.',
  'de novembro',
  'Nada mais programado hoje.',
  '<b>Próximo:</b>',
  'em Roma</span>',
  'Agora: ',
  'Ingresso ',
  'Mapa ↗',
  'Idiomas <span class="langtag" aria-hidden="true">IT · EN</span>',
  'Feito</label>',
  'Sem áudio neste navegador. Ouvir no Google Tradutor ↗',
  'Tocando…',
  'Copiado',
])
  inRaw(s);

// ---------- documento ----------
const docStrings = [
  doc.overview.lead,
  ...doc.overview.bullets.flatMap((b) => [b.title, b.text]),
  doc.overview.premise,
  doc.placesSummary.intro,
  doc.placesSummary.legend,
  ...doc.placesSummary.rows.flatMap((r) => [r.day, r.places, r.paid]),
  doc.transport.intro,
  doc.transport.prices,
  ...doc.transport.routes.flatMap((r) => [r.route, r.how, r.time]),
  doc.hotels.intro,
  doc.hotels.note,
  doc.hotels.extra,
  doc.hotels.suggestion,
  ...doc.hotels.options.flatMap((o) => [o.name, o.rating, o.price, o.why]),
  doc.budgetDetails.intro,
  doc.budgetDetails.note,
  ...doc.budgetDetails.rows.flatMap((r) => [r.category, r.range]),
  doc.decisions.intro,
  ...doc.decisions.items.map((d) => d.text),
  doc.sources.note,
  ...doc.sources.items,
  ...days.filter((d) => d.details).flatMap((d) => [d.details.intro, ...d.details.tips]),
];
for (const s of docStrings) {
  check(mdText.includes(norm(s)), `documento: texto ausente "${s.slice(0, 70)}…"`);
  compared++;
}
const mdRows = (md.match(/^\| /gm) ?? []).length;
const mdBullets = (md.match(/^- /gm) ?? []).length;

if (excused.length) {
  console.log(`ℹ ${excused.length} diferença(s) liberada(s) em scripts/parity-exceptions.json:`);
  for (const e of excused) console.log('  - ' + e);
}
if (problems.length) {
  console.error(`✗ Paridade de conteúdo FALHOU (${problems.length} problema(s)):`);
  for (const p of problems.slice(0, 60)) console.error('  - ' + p);
  process.exit(1);
}
console.log(
  `✓ Paridade de conteúdo OK: ${compared} comparações — ${days.length} dias, ` +
    `${days.reduce((n, d) => n + d.items.length, 0)} itens, ${Object.keys(phrases).length} conjuntos de frases ` +
    `(IT+EN), ${tickets.length} ingressos, ${todo.length} pendências, textos fixos e documento ` +
    `(${mdRows} linhas de tabela e ${mdBullets} itens de lista conferidos por texto).`,
);
