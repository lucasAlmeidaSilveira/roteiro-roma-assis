# Progresso

> Atualize ao fim de cada sessão. É a memória do projeto entre sessões do Claude Code.

## Situação

| Fase                      | Status | Data       | Commit                   |
| ------------------------- | ------ | ---------- | ------------------------ |
| 0 · Preparação            | ✅     | 2026-11-10 | `chore: kit inicial`     |
| 1 · Casca                 | ✅     | 2026-11-10 | `feat(fase-1)`           |
| 2 · Dia a dia             | ✅     | 2026-11-10 | `feat(fase-2-3)`         |
| 3 · Agora/Próximo         | ✅     | 2026-11-10 | `feat(fase-2-3)`         |
| 4 · Idiomas               | ✅     | 2026-11-10 | `feat(fase-4)`           |
| 5 · Lugares               | ✅     | 2026-11-10 | `feat(fase-5-6)`         |
| 6 · Infos                 | ✅     | 2026-11-10 | `feat(fase-5-6)`         |
| 7 · Intenções             | ✅     | 2026-11-10 | `feat(fase-7)` + D-15/16 |
| 8 · Offline/PWA           | ✅     | 2026-11-10 | `feat(fase-8-9)`         |
| 9 · Qualidade e auditoria | ✅     | 2026-11-10 | `feat(fase-8-9)`         |
| 10 · Publicação           | ⏳     |            | com o Lucas (DEPLOY.md)  |

Legenda: ⏳ a fazer · 🚧 em andamento · ✅ pronta (fase habilitada em `tests/fases.json` e `check:all` verde)

## Próximo passo

Fase 10 — publicar seguindo `docs/DEPLOY.md` (GitHub privado → Vercel → teste no iPhone; sem variáveis nem
Google Cloud). Pendências manuais da Fase 9 que dependem do app publicado: Lighthouse mobile (anotar os números
aqui) e a conferência visual no iPhone.

## Registro

- 2026-11-10 · Fase 0 · `git init -b main`, `npm ci`, Playwright Chromium instalado. `npm run check` verde
  (42 unitários, 1.507 comparações de paridade); `npm run test:e2e:legacy` verde (66 testes no site antigo).
- 2026-11-10 · Fases 1–9 numa única sessão (pedido do Lucas: "monte tudo"). Resultado: `npm run check:all` verde
  — lint, typecheck, 65 unitários (23 novos: sessão JWT, env, planilha, `ItemCard`, `PhraseRow`, `LoginForm`),
  paridade 1.507/1.507, build (23 páginas estáticas) e **79 testes de aceitação** no app novo com as fases 1–9
  habilitadas; `test:e2e:legacy` continua verde (66).
  - **Casca:** `Header` (servidor) com `ThemeSwitch`, `SectionsNav` e `DayChips` (cliente); `Footer` fora do
    `<main>`; `/` → `RedirectToToday`; `not-found.tsx`; CSS Modules com os valores do legado.
  - **Dia:** `DayView` (servidor) + `DayTimeline` (ilha cliente com `NowCard`, `ItemCard` e um único
    `PhrasesDialog`); `Countdown`; `DayDetails`; `StayBlock`.
  - **Idiomas:** `<dialog>` nativo com `showModal()`, foco no ✕ ao abrir e de volta ao botão ao fechar, Esc e
    backdrop fecham, rolagem travada, `lang` nas frases, `PhraseRow` com Ouvir/Tocando…/fallback e
    Copiar/Copiado.
  - **Lugares/Infos:** `PlacesDay`, `PlacesSummary`, `Checklist` (pendências e decisões), `KeyValueCard`,
    `DocSections` (7 blocos `<details>` com o conteúdo do documento).
  - **Intenções:** `src/server/{env,session,sheets,intentions-source}.ts` (`server-only`), `POST/DELETE/GET
/api/sessao`, `GET /api/intencoes`; `IntentionsPanel`, `LoginForm`, `MessageCard`.
  - **PWA/qualidade:** `manifest.ts`, `robots.ts`, `ServiceWorkerRegister` (só produção), cabeçalhos do `/sw.js`
    em `next.config.ts`; axe sem problemas graves em todas as páginas e no popup (dois temas); zero erros de
    console; capturas 390×844 @2x comparadas lado a lado com `legacy/screenshots/` (dia 15 claro/escuro, dia 19,
    dia 14, popup IT/EN, Lugares, Infos): mesma composição, mesmas cores e tamanhos.
  - **Decisões/aprendizados:** D-13 (tema padrão claro, pedido do Lucas); o Next 16 mantém a rota anterior
    escondida no DOM (`<Activity>`), por isso `/` usa `<div>` e não `<main>`; `GET /api/sessao` evita o 401 que o
    Chromium registra como erro no console; a Testing Library precisa de `cleanup()` em `tests/setup.ts`.

- 2026-11-10 · Revisão pelo subagente `revisor` e pedidos do Lucas na mesma sessão:
  - **Corrigido (crítico):** decisões já fechadas nos dados não podiam ser desmarcadas (`Checklist` agora semeia
    `decisao-4/6` uma vez no mapa de Feito, com a chave `decisoes-semeadas-v1`, e depois obedece ao usuário).
  - **Corrigido (importante):** checklists recuadas 18 px; `<details>` sem indicador de abrir/fechar (▸/▾);
    tabelas roláveis focáveis e rotuladas (`role="region"`, `tabIndex`); `fetch` offline sem `try/catch`.
  - **Opcionais aplicados:** "Carregando…" sempre ao Atualizar; manifesto lendo de `ui.json`; `MapLink plain`;
    links sem JS da página inicial com "Sáb 14…"; `.small` morto removido; lista de intenções focável.
  - **D-14 — abas no rodapé:** `SectionsNav` virou barra fixa no rodapé com ícone + nome (pedido: "padrão de
    app"). Cabeçalho ficou com marca, tema e chips dos dias.
  - **D-15 — intenções sem código de acesso:** removidos `/api/sessao`, `session.ts`, `LoginForm`,
    `OWNER_PASSCODE`, `AUTH_SECRET` e a dependência `jose`; `07-intencoes.spec.ts` reescrito (aba aberta);
    DEPLOY.md, SPEC, ARCHITECTURE, `.env.example` e `.claude/rules/servidor.md` atualizados.
  - Resultado: `check:all` verde (57 unitários; e2e com as fases 1–9).

- 2026-11-10 · **D-16 — planilha lida pelo export em CSV, sem Google Cloud** (pedido do Lucas: "um sistema mais
  simples"). Novo `src/lib/csv.ts` (leitor RFC 4180 + links do export, 7 testes), `src/server/sheets.ts` reescrito
  com `fetch` e mapeamento de erros (HTML de login → `forbidden`), `sheetUrl` acrescentado em
  `src/data/intentions.json` (o mesmo link `INTENT.sheet` do site antigo) e textos `notConfigured`/`forbidden` de
  `ui.json` ajustados. Removidos `google-auth-library` e todas as variáveis obrigatórias (`INTENCOES_GID` é
  opcional). Conferido com `curl`: o export da planilha real já responde em CSV — nada a configurar na Vercel.
  `check:all` verde (60 unitários).

## Dúvidas para o Lucas

- **Rótulos que não estão em `src/data`:** os cabeçalhos das tabelas do documento ("Dia · Lugares · Ingresso
  pago" em `PlacesSummary`; "Trajeto · Como ir · Tempo aprox." em `DocSections`) e o título "Convidados" (lista
  de convidados da Convenção, `event.json → guests`) estão escritos nos componentes, porque `ui.json` não os tem e
  `src/data` só muda com pedido seu. Se quiser, movo para `ui.json` (chave `tables`) — é uma mudança de 5 minutos.
- **Lighthouse (RNF-03):** não foi medido nesta sessão (precisa do app publicado ou do Chrome com Lighthouse).
  Fazer na Fase 10 e anotar aqui.
- **Texto "(código: rede)"** no erro de falta de internet da aba Intenções: a palavra "rede" está no componente
  (`IntentionsPanel.tsx`), porque `ui.json` não tem uma chave para isso. Mover para `ui.json` junto com os rótulos
  de tabela acima, se você quiser.
- **Intenções abertas (D-15):** qualquer pessoa com o link lê as intenções, com o nome de quem escreveu. O site
  continua fora dos buscadores. A versão com código de acesso (cookie JWT, `/api/sessao`) foi retirada antes do
  commit da Fase 7 e não está no histórico; a especificação dela ficou descrita em `DECISIONS.md` D-08/D-15 e na
  SPEC RF-11 (versão 1.0), dá para refazer em ~1 h se precisar.

## Mudanças de conteúdo

- 2026-11-10 · **Abas no rodapé (D-14)** e **intenções abertas sem código (D-15)** — pedidos do Lucas; não são
  conteúdo, mas divergem do site antigo. Registrados em `DECISIONS.md`, SPEC RF-01.3/RF-10/RF-11/RF-12 e DESIGN §4.3.
- 2026-11-10 · **Tema padrão claro** (pedido do Lucas: "o tema padrão deve ser o claro"). Não é conteúdo, mas é
  uma divergência deliberada do site antigo (que seguia o sistema): SPEC RF-02.2, DESIGN §2, DECISIONS D-13,
  `src/styles/tokens.css`, `src/lib/theme.ts` e o teste "sem escolha salva" em `tests/e2e/01-layout.spec.ts`
  (que agora distingue legado × app novo). Nada em `src/data` mudou; `parity-exceptions.json` não precisou de
  entrada.

## Auditoria de paridade (Fase 9)

- `npm run parity`: 1.507/1.507. `npm run test:e2e:legacy`: 66/66. `npm run test:e2e`: 79/79 (fases 1–9).
- Conferência manual dos comportamentos do JS original → app: tema (chave + persistência; padrão claro por D-13),
  rotas (hash → caminhos), dia de hoje/contagem regressiva, Agora/Próximo a cada minuto (`useNow`), destaque do
  item atual, Feito persistente (mesma chave `roteiro-roma-feitos-v1`), popup (Esc, backdrop, ✕, foco, idioma
  salvo em `roteiro-roma-idioma`, fala com fallback de 2,5 s, cópia com seleção de reserva), Lugares (filtro
  `placesForDay`, ingressos oficiais), Infos (pendências com `todo-N`), Intenções (lista, atualizar, mensagem,
  onde levar — agora com login próprio, RF-10). Capturas comparadas lado a lado: sem diferenças relevantes.
- Lacuna conhecida e aceita: os rótulos de tabela citados em "Dúvidas para o Lucas".
