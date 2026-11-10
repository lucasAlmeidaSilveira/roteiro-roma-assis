# Plano de implementação

Uma fase por sessão do Claude Code (use `/clear` entre fases). Cada fase termina **verde**: `npm run check:all`
passando com a fase habilitada em `tests/fases.json`, `docs/PROGRESS.md` atualizado e um commit.

## Definição de pronto (vale para todas as fases)

- [ ] Requisitos da fase (SPEC) implementados — nada do legado deixado de fora.
- [ ] Número da fase acrescentado em `tests/fases.json` → `"habilitadas"`.
- [ ] `npm run check:all` passa (lint, typecheck, unitários, paridade, build, e2e).
- [ ] Testes novos para lógica nova (componentes com estado, server).
- [ ] Sem `any`, sem `eslint-disable`, sem `@ts-expect-error`, sem cor fora dos tokens, sem texto fora de `src/data`.
- [ ] Revisão pelo subagente `revisor` sem pendências críticas.
- [ ] `docs/PROGRESS.md`: o que foi feito, decisões, dúvidas, próximo passo.
- [ ] Commit: `feat(fase-N): …` (Conventional Commits).

---

## Fase 0 · Preparação (sem UI)

**Objetivo:** ambiente pronto e conhecimento do projeto. **RF:** RF-16.

1. `git init -b main` (se ainda não for repositório; antes do `npm ci`, para o Husky instalar os hooks), `npm ci`
   (Node 24 — veja `.nvmrc`), `npx playwright install --with-deps chromium`.
2. `npm run check` deve passar já de cara (fundação pronta: dados, lógica, testes).
3. `npm run test:e2e:legacy` deve passar (66 testes no site antigo = a definição de paridade).
4. Ler `CLAUDE.md`, `docs/SPEC.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md` e abrir `legacy/screenshots/*`.
5. Primeiro commit `chore: kit inicial` e push para o GitHub (veja `docs/DEPLOY.md` §1).

**Pronto quando:** os três comandos passam e `docs/PROGRESS.md` registra a Fase 0.

## Fase 1 · Casca do app

**RF:** RF-01, RF-02. **Testes:** `01-layout`.

1. `src/components/shell/`: `Header` (marca + data + `ThemeSwitch`), `SectionsNav` (cliente: `usePathname` para
   `aria-current`), `DayChips` (cliente: dia ativo pela rota, "hoje" por `useNow`+`tripState`, rola o ativo para o
   centro), `Footer`, `PageHeader` (eyebrow + h2 + parágrafo opcional).
2. `layout.tsx`: `<Header/>`, `{children}`, `<Footer/>` (rodapé fora do `<main>`), `.wrap`, faixa do notch.
3. Rotas com cabeçalho de página: `/dia/[dia]` (eyebrow + h2 do dia; `generateStaticParams`; `notFound()`),
   `/lugares`, `/infos`, `/intencoes` (cabeçalhos da SPEC), `not-found.tsx`.
4. `/` → `RedirectToToday` (ARCHITECTURE §3.2) com links de fallback.
5. CSS Modules a partir do DESIGN §4.1–4.4; `globals.css` com base e foco.

**Pronto quando:** `01-layout` passa; troca de tema sem flash ao recarregar; chips rolam.

## Fase 2 · Dia a dia completo

**RF:** RF-03, RF-05, RF-06, RF-13.1. **Testes:** `02-dia`.

1. `DayView` (servidor): cabeçalho do dia (eyebrow, h2, resumo, chips cidade/Convenção), alerta, nota,
   `DayDetails` (`<details>` com `InlineText`), `StayBlock`.
2. `DayTimeline` (cliente) + `ItemCard`: horário, lugar, ação, selo, custo/ingresso, "Mapa ↗", botão "Idiomas"
   (por enquanto sem popup), "Feito" com `useDoneMap`; `li id="it-{id}"`.
3. `Countdown` (cliente) antes da viagem (`daysUntilTrip`).
4. `ui/InlineText.tsx` (renderiza `parseInline`), `ui/Chip`, `ui/Card`, `ui/ExternalLink` (nova aba + `noopener`).
5. Teste de componente para `ItemCard` (custo pago vs. normal, selo, sem mapa).

**Pronto quando:** `02-dia` passa (10 dias × todos os itens), "Feito" persiste.

## Fase 3 · Agora / Próximo

**RF:** RF-04. **Testes:** `03-agora`.

1. `NowCard` (cliente, `role="status"`) usando `useNow`, `tripState`, `nowNext`, `formatClock`, `formatDuration`.
2. Destaque do item atual (`aria-current="time"` + contorno).
3. Garantir que nada dependente de hora é renderizado no servidor (sem erro de hidratação).

**Pronto quando:** `03-agora` passa, inclusive "avança sozinho a cada minuto".

## Fase 4 · Popup de idiomas

**RF:** RF-07. **Testes:** `04-idiomas` (inclui um teste por conjunto de frases).

1. `PhrasesDialog` (cliente, `<dialog>` + `showModal()`), `PhraseRow` (Ouvir/Tocando…/fallback, Copiar/Copiado).
2. Troca IT/EN com `useLang`; `stopSpeech()` ao trocar e ao fechar; `initSpeech()` ao montar.
3. Foco: vai para "Fechar" ao abrir e volta ao gatilho ao fechar; Esc e backdrop fecham; rolagem travada.
4. `lang="it"`/`lang="en"` no texto da frase.
5. Teste de componente do `PhraseRow` com fala simulada (começa / nunca começa / erro).

**Pronto quando:** `04-idiomas` passa (33 testes) e o popup funciona no iPhone (checar na Fase 10).

## Fase 5 · Lugares

**RF:** RF-08, RF-13.2. **Testes:** `05-lugares`.

1. `PlacesDay` por dia usando `placesForDay()`; botão de ingresso dourado com nota; "Mapa ↗".
2. `PlacesSummary` em `<details>` "Resumo por dia".

**Pronto quando:** `05-lugares` passa.

## Fase 6 · Infos práticas

**RF:** RF-09, RF-13.3. **Testes:** `06-infos`.

1. `Checklist` (cliente) reutilizável para pendências (`todo-N`) e decisões (`decisao-N`, iniciando com `done`
   dos dados quando não houver marcação salva).
2. Cartões Hospedagens, Transporte, Orçamento, Lembretes (`KeyValueCard`, `InlineText`).
3. `DocSections`: Visão geral e alertas, Como se locomover, Hospedagem 22→23, Programação da Convenção,
   Decisões em aberto, Como o orçamento foi calculado, Fontes — cada um em `<details>`.

**Pronto quando:** `06-infos` passa.

## Fase 7 · Intenções (backend + interface)

**RF:** RF-10, RF-11, RF-12. **Testes:** `07-intencoes`.

1. `src/server/env.ts`, `sheets.ts` (google-auth-library), `intentions-source.ts` (fixture ou Google), todos com
   `import 'server-only'`. (A sessão por código, `session.ts` + `/api/sessao`, foi retirada: D-15.)
2. `app/api/intencoes/route.ts` (GET), com `no-store`.
3. `IntentionsPanel` (cliente): busca a API, estados (carregando / lista / vazio / erros), "Atualizar";
   `MessageCard` (copiar com fallback); "Onde levar".
4. Testes unitários do servidor: variáveis de ambiente, mapeamento de erros do Google (fetcher simulado).

**Pronto quando:** `07-intencoes` passa e `docs/DEPLOY.md` §3 está claro para o Lucas.

## Fase 8 · App instalável e offline

**RF:** RF-15. **Testes:** `08-pwa`.

1. `app/manifest.ts` (SPEC RF-15.1), `ServiceWorkerRegister` no layout (só produção).
2. Cabeçalhos do `/sw.js` em `next.config.ts`.
3. Rodar `08-pwa`; ajustar `public/sw.js` só se necessário (ele já foi validado num protótipo).

**Pronto quando:** `08-pwa` passa; instalar na tela inicial do iPhone abre em tela cheia.

## Fase 9 · Qualidade final e auditoria de paridade

**RF:** RF-14, RNF-01..08. **Testes:** `09-qualidade` + tudo.

1. `app/robots.ts` (`Disallow: /`), conferir cabeçalhos, `X-Powered-By` desligado.
2. axe sem problemas graves (todas as páginas, popup nos dois temas); corrigir contraste/nomes.
3. Zero erros no console em todas as rotas.
4. Capturas do app novo iguais às de `legacy/screenshots/` (mesmo tamanho) e comparação visual.
5. Lighthouse mobile ≥ 90 (Performance e Acessibilidade) na página do dia — anotar números no PROGRESS.
6. `/paridade` (skill) → o subagente `auditor-paridade` confere SPEC × código × legado e lista lacunas; corrigir.
7. README atualizado; `git tag v1.0.0`.

**Pronto quando:** fases 1–9 habilitadas, `npm run check:all` verde, auditoria sem lacunas.

## Fase 10 · Publicação (com o Lucas)

Siga `docs/DEPLOY.md`: GitHub (repositório privado), Vercel, variáveis, conta de serviço do Google, teste no
iPhone (tema, popup e áudio com o modo silencioso desligado, offline em modo avião, instalar na tela inicial,
intenções aparecendo).
