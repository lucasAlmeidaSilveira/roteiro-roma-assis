---
name: status
description: Mostra em que ponto o projeto está (fases, testes, pendências) e qual é o próximo passo.
disable-model-invocation: true
---

Sem editar arquivos:

1. Leia `docs/PROGRESS.md`, `tests/fases.json` e `git log --oneline -15`.
2. Rode `npm run check` e diga se está verde.
3. Responda em até 12 linhas: fases prontas, fase em andamento, testes falhando (se houver), dúvidas abertas para o
   Lucas e o próximo comando a rodar (ex.: `/fase 4`).
