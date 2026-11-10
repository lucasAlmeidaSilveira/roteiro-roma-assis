# Roteiro Roma e Assis · 14–24/11/2026

App web (celular primeiro, instalável e offline) com o roteiro dia a dia da viagem a Roma e Assis para a
Convenção Shalom 45 anos: o que fazer agora e depois, mapas, ingressos, frases em italiano e inglês com áudio,
infos práticas e as intenções de oração recebidas pelo Google Forms.

É a recriação em Next.js do site original (`legacy/site.html`), com **paridade total** de conteúdo e
comportamento, pronta para GitHub + Vercel.

## Começo rápido

```bash
nvm use            # Node 24
git init -b main   # antes do npm ci, para o Husky instalar os hooks
npm ci
npx playwright install --with-deps chromium
npm run check      # lint + tipos + testes + paridade de conteúdo
npm run dev        # http://localhost:3000
```

Construção com o Claude Code: siga **`docs/PROMPTS.md`** (Prompt 0 e depois `/fase 1` … `/fase 9`).
Publicação: **`docs/DEPLOY.md`**.

## Documentos

| Arquivo                                                           | Para quê                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `CLAUDE.md`                                                       | instruções permanentes para o Claude Code                            |
| `docs/SPEC.md`                                                    | requisitos numerados e contratos (o quê)                             |
| `docs/IMPLEMENTATION_PLAN.md`                                     | fases e definição de pronto (em que ordem)                           |
| `docs/DESIGN.md`                                                  | tokens, tipografia e componentes (como parece)                       |
| `docs/ARCHITECTURE.md`                                            | rotas, servidor/cliente, dados, API, offline, testes (como funciona) |
| `docs/PROMPTS.md`                                                 | prompts prontos para cada etapa                                      |
| `docs/DEPLOY.md`                                                  | GitHub, Vercel e Google passo a passo                                |
| `docs/ACCEPTANCE_CHECKLIST.md`                                    | checklist de paridade gerado dos dados (`npm run checklist`)         |
| `docs/DECISIONS.md` · `docs/PROGRESS.md` · `docs/SWEEP_REPORT.md` | decisões, progresso, varredura                                       |

## Comandos

| Comando                   | O que faz                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`             | servidor de desenvolvimento                                                        |
| `npm run check`           | lint, typecheck, testes unitários, paridade de conteúdo                            |
| `npm run test:e2e`        | testes de aceitação no build de produção (fases habilitadas em `tests/fases.json`) |
| `npm run test:e2e:legacy` | os mesmos testes no site original                                                  |
| `npm run check:all`       | tudo acima + build                                                                 |
| `npm run parity`          | prova que `src/data` contém tudo do site e do documento originais                  |
| `npm run checklist`       | regenera `docs/ACCEPTANCE_CHECKLIST.md`                                            |

## Stack

Next.js 16.4 (App Router, Cache Components, React Compiler) · React 19.3 · TypeScript · Zod · CSS Modules ·
Vitest · Playwright + axe · Vercel. Fontes OFL self-hosted (`src/fonts/LICENSES.txt`).

## Privacidade

Fora dos buscadores (`noindex`). Intenções só para o dono (código de acesso), lidas da planilha por uma conta de
serviço somente leitura; nunca vão para cache, log ou para o repositório. Segredos só em variáveis de ambiente.
