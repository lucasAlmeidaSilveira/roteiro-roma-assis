---
name: fase
description: Executa uma fase do docs/IMPLEMENTATION_PLAN.md do início ao fim (plano, implementação, testes, revisão, progresso e commit).
argument-hint: [número da fase, 0 a 10]
disable-model-invocation: true
---

Execute a **Fase $ARGUMENTS** de `docs/IMPLEMENTATION_PLAN.md`.

## 1. Entender (sem editar nada)

- Leia `docs/PROGRESS.md` (onde paramos), a seção da Fase $ARGUMENTS no plano, os requisitos da `docs/SPEC.md` que
  ela cita, a `docs/SPEC.md` §6 (contratos), e os testes `tests/e2e/*` que a fase habilita.
- Leia o trecho correspondente de `legacy/site.html` (JS e CSS) e as capturas em `legacy/screenshots/`.
- Para cada API do Next.js que for usar, leia o guia em `node_modules/next/dist/docs/`.

## 2. Planejar

- Apresente um plano curto: arquivos a criar/alterar, o que é servidor e o que é cliente, dados que cada componente
  cliente recebe por props, riscos (hidratação, acessibilidade, iOS). Espere aprovação se estiver em plan mode.

## 3. Implementar

- Siga `CLAUDE.md`, `docs/DESIGN.md` e `docs/ARCHITECTURE.md`. Reaproveite `src/lib` e `src/hooks` (já testados).
- Textos só de `src/data`. Nada de cor literal. Nomes acessíveis exatamente como na SPEC §6.
- Escreva testes unitários para lógica/estado novos.

## 4. Verificar (obrigatório)

- Acrescente $ARGUMENTS em `tests/fases.json` → `"habilitadas"` (sem remover números).
- Rode `npm run check:all`. Itere até ficar verde, corrigindo a causa raiz.
- Proibido mudar `src/data`, `tests/e2e` ou `tests/unit/data.test.ts` para passar. Se um teste parecer errado,
  pare e mostre a evidência do `legacy/site.html`.
- Com `npm run dev` rodando, use o MCP `next-devtools` (`get_errors`) nas rotas tocadas: zero erros.

## 5. Revisar

- Use o subagente `revisor` no diff da fase (`git diff`) contra a SPEC. Corrija o que for crítico ou requisito
  faltando; ignore preferências de estilo.

## 6. Registrar

- Atualize `docs/PROGRESS.md` (tabela, registro com data, decisões, dúvidas, próximo passo).
- Commit: `feat(fase-$ARGUMENTS): <resumo>` (ou `chore(fase-0)` / `docs(...)` conforme o caso).
- Termine mostrando: saída final do `npm run check:all` e a lista de requisitos atendidos.
