@AGENTS.md

# Roteiro Roma e Assis — instruções do projeto

## O que é

App web (PWA, celular primeiro) com o roteiro do Lucas em Roma e Assis, 14–24/11/2026 (Convenção Shalom 45 anos).
Recriação em Next.js do site original `legacy/site.html`, com **paridade total** de conteúdo e comportamento, para
publicar na Vercel. Usuário principal: iPhone 15 (Arc/Safari, WebKit), muitas vezes offline.

## Onde está cada coisa (leia antes de codar)

- `docs/SPEC.md` — requisitos numerados (RF/RNF) e contratos de UI usados pelos testes. O "o quê".
- `docs/IMPLEMENTATION_PLAN.md` — fases e definição de pronto. O "em que ordem".
- `docs/DESIGN.md` + `legacy/screenshots/` — visual exato. `docs/ARCHITECTURE.md` — estrutura e padrões verificados.
- `docs/PROGRESS.md` — onde paramos. Leia no início; atualize no fim de cada sessão.
- `src/data/*.json` — TODO o conteúdo (fonte da verdade). `src/data/ui.json` — textos fixos da interface.
- `legacy/site.html`, `legacy/roteiro-doc.md` — originais, somente leitura (o CSS do site está nas linhas 6–151).
- Já prontos e testados: `src/lib/*`, `src/hooks/*`, `src/styles/tokens.css`, `src/app/fonts.ts`, `public/sw.js`.

## Regras de ouro

1. IMPORTANT: nada do site antigo pode ficar de fora. Se algo do legado não estiver na SPEC, ou se SPEC e legado
   divergirem, pare e registre em `docs/PROGRESS.md` → "Dúvidas para o Lucas" em vez de inventar.
2. IMPORTANT: não altere `src/data/`, `tests/e2e/` nem `tests/unit/data.test.ts` para fazer teste passar. Os testes
   de `tests/e2e` passam no site original; se um parecer errado, mostre a evidência e pergunte.
3. Todo texto visível vem de `src/data` (via `src/lib/content.ts` no servidor ou `src/lib/copy.ts` no cliente),
   em pt-BR, exatamente como está. Nenhum texto do roteiro escrito em componente.
4. Uma fase por vez. Ao terminar: acrescente o número em `tests/fases.json`, rode `npm run check:all`, peça
   revisão ao subagente `revisor`, atualize `docs/PROGRESS.md` e faça commit `feat(fase-N): …`.
5. Next.js 16.4 tem APIs novas: antes de usar uma, leia o guia em `node_modules/next/dist/docs/`.
6. Nova dependência só com motivo registrado em `docs/DECISIONS.md`.
7. Segredos só em variáveis de ambiente. Não leia nem crie `.env.local`; use `.env.example` como referência.

## Comandos

- `npm run dev` — desenvolvimento (http://localhost:3000; o MCP `next-devtools` mostra erros de runtime)
- `npm run check` — lint + typecheck + unitários + paridade de conteúdo (rápido; rode sempre)
- `npm run test:e2e` — aceitação no build de produção (só fases em `tests/fases.json`)
- `npm run test:e2e:legacy` — os mesmos testes no site original
- `npm run check:all` — tudo (obrigatório antes de commit de fase)
- Um teste só: `npx playwright test tests/e2e/02-dia.spec.ts -g "Sáb 14"` · `npx vitest run tests/unit/time.test.ts`

## Código

- TypeScript estrito, sem `any`, sem `eslint-disable`, sem `@ts-expect-error`. Zod nas fronteiras (dados, env, API).
- Server Components por padrão; `'use client'` só onde há estado, efeito ou evento, o mais perto da folha possível.
- Componente cliente recebe só o necessário por props; nunca importa `src/lib/content.ts` (é `server-only`).
- Hora: só via `useNow`/`tripState`/`nowNext` (horário de Roma). Nada que dependa de hora ou localStorage no HTML
  do servidor (evita erro de hidratação).
- localStorage só via `src/lib/storage.ts` e `src/hooks/use-stored.ts` (chaves do site original).
- Estilo: CSS Modules + tokens de `src/styles/tokens.css`; nenhuma cor literal; valores do `docs/DESIGN.md`.
- Texto com `**negrito**`/`[link](url)`: renderizar com `parseInline` (nunca `dangerouslySetInnerHTML`).
- Acessibilidade é requisito: nomes acessíveis e ids da SPEC §6 são contrato dos testes.
- Arquivos em kebab-case (exceto componentes, em PascalCase); testes ao lado (`*.test.tsx`) ou em `tests/unit`.

## Fluxo de trabalho

- Comece cada fase em plan mode (Shift+Tab) ou com `/fase N`; implemente; verifique; revise; commit.
- Skills do projeto: `/fase N`, `/paridade`, `/status`. Subagentes: `revisor`, `auditor-paridade`.
- Mostre evidência (saída dos testes), não só "pronto".
- Ao compactar o contexto, preserve: fase atual, arquivos alterados, testes falhando, decisões e dúvidas.
