#!/usr/bin/env node
/**
 * Gera docs/ACCEPTANCE_CHECKLIST.md a partir de src/data: a lista humana de tudo o que precisa existir no app.
 * Os testes automáticos verificam o mesmo; este arquivo serve para revisão manual e visual (ex.: no iPhone).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const days = read('src/data/days.json');
const phrases = read('src/data/phrases.json');
const tickets = read('src/data/tickets.json');
const todo = read('src/data/todo.json');
const infos = read('src/data/infos.json');
const doc = read('src/data/doc.json');
const ev = read('src/data/event.json');
const intentions = read('src/data/intentions.json');

const L = [];
const p = (s = '') => L.push(s);
const box = (s) => p(`- [ ] ${s}`);

p('# Checklist de aceitação (gerado)');
p();
p(
  '> Gerado por `npm run checklist` a partir de `src/data`. Não edite à mão. Os testes em `tests/e2e` verificam',
);
p('> estes itens automaticamente; use esta lista para a conferência visual no iPhone (Fase 10).');
p();
p('## Casca (RF-01, RF-02)');
for (const s of [
  'Cabeçalho fixo com "Roma e Assis", data (some no celular estreito) e chave Claro/Escuro',
  'Seções na barra de abas do rodapé (ícone + nome): Dia a dia · Lugares · Intenções · Infos (ativa em azul)',
  '10 chips de dias (14 a 23), dia aberto em azul, hoje com borda, rolagem horizontal',
  'Tema: padrão claro (D-13); escolha salva; sem flash ao recarregar',
  '"/" abre o dia de hoje em Roma (ou 14 antes da viagem)',
  'Rodapé com o aviso de horários e do "Feito" salvo no aparelho',
])
  box(s);
p();
p('## Dias (RF-03 a RF-06)');
for (const d of days) {
  p();
  p(`### ${d.weekday} ${d.day} · ${d.title} — ${d.items.length} itens · ${d.city}`);
  if (d.alert) box(`Alerta: **${d.alert.title}**`);
  for (const it of d.items) {
    const tags = [
      it.event ? 'Convenção' : '',
      it.paid ? `Ingresso ${it.cost}` : it.cost !== '—' ? it.cost : '',
      it.mapQuery ? 'Mapa' : '',
      `Idiomas: ${phrases[it.phrases].title}`,
    ].filter(Boolean);
    box(`\`${it.label}\` ${it.place} — ${tags.join(' · ')}`);
  }
  if (d.note) box(`Nota: ${d.note.slice(0, 80)}…`);
  if (d.details) box(`Mais detalhes do roteiro (${1 + d.details.tips.length} parágrafo(s))`);
  box(`Onde dormir: ${d.stay}`);
}
p();
p('## Agora / Próximo (RF-04)');
for (const s of [
  'Só no dia de hoje; "Hoje · HHhMM em Roma"; "Agora:" + ação; "Próximo: … às … (em …)"',
  '"Nada mais programado hoje." depois do último item',
  'Item em andamento com contorno azul; atualiza a cada minuto',
  'Madrugada do dia 24 conta como dia 23 (check-in do voo às 02h55)',
  'Contagem regressiva antes da viagem ("A viagem começa em N dias…")',
])
  box(s);
p();
p(`## Idiomas — ${Object.keys(phrases).length} conjuntos (RF-07)`);
for (const [k, s] of Object.entries(phrases))
  box(`${s.title} (\`${k}\`): ${s.it.length} frases IT + ${s.en.length} EN`);
for (const s of [
  'Ouvir → "Tocando…"; sem áudio em 2,5 s → link do Google Tradutor',
  'Copiar → "Copiado"',
  'Italiano/English lembrado entre aberturas',
  'Esc, ✕ e toque fora fecham; foco volta ao botão',
  'Dica do modo silencioso no fim',
])
  box(s);
p();
p('## Lugares (RF-08)');
box('Introdução com o aviso de sites falsos');
for (const t of tickets) box(`Ingresso: ${t.place} → "${t.label} ↗" (${t.url}) — ${t.note}`);
box(`Resumo por dia (tabela do documento, ${doc.placesSummary.rows.length} linhas)`);
p();
p('## Infos (RF-09, RF-13)');
for (const t of todo) box(`Pendência: ${t.text}`);
for (const s of infos.stays.items) box(`Hospedagem: ${s.title}`);
box(`Transporte em Roma (${infos.transport.rows.length} linhas + nota)`);
box(`Orçamento por pessoa (${infos.budget.rows.length} linhas)`);
box(`Lembretes (${infos.reminders.items.length})`);
box(`Visão geral e alertas (${doc.overview.bullets.length} itens)`);
box(`Como se locomover em Roma (${doc.transport.routes.length} trajetos)`);
box(`Hospedagem barata 22→23/11 (${doc.hotels.options.length} opções)`);
box(`Programação da Convenção (${ev.days.length} dias, ${ev.guests.length} convidados)`);
box(
  `Decisões em aberto (${doc.decisions.items.length}, ${doc.decisions.items.filter((d) => d.done).length} já marcadas)`,
);
box(`Como o orçamento foi calculado (${doc.budgetDetails.rows.length} linhas)`);
box(`Fontes consultadas (${doc.sources.items.length})`);
p();
p('## Intenções (RF-10 a RF-12)');
for (const s of [
  'Aberta a quem tem o link (D-15): sem código de acesso',
  'Lista das intenções (mais novas no topo), contagem, "Atualizado às…", Atualizar',
  'Mensagem para enviar com o link do formulário + Copiar mensagem',
  `Onde levar: ${intentions.where.length} lugares`,
  'Erros claros: não configurado / sem acesso à planilha / código do erro',
])
  box(s);
p();
p('## App e qualidade (RF-14, RF-15, RNF)');
for (const s of [
  'Adicionar à Tela de Início no iPhone abre em tela cheia com o ícone R·A',
  'Modo avião depois da primeira visita: dias, Lugares e Infos abrem',
  'Fora dos buscadores (noindex, robots.txt)',
  'Sem erros no console; axe sem problemas graves; Lighthouse mobile ≥ 90',
  'Tema escuro legível em todas as telas e no popup',
])
  box(s);

writeFileSync(new URL('docs/ACCEPTANCE_CHECKLIST.md', root), L.join('\n') + '\n');
console.log(
  `docs/ACCEPTANCE_CHECKLIST.md gerado (${L.filter((l) => l.startsWith('- [ ]')).length} itens).`,
);
