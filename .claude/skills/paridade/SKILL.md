---
name: paridade
description: Auditoria completa de paridade entre o site original (legacy/) e o app novo — conteúdo, comportamento e visual — com lista de lacunas e correções.
disable-model-invocation: true
---

Faça a auditoria de paridade do app.

1. Rode e mostre o resultado de: `npm run parity`, `npm run test:e2e:legacy`, `npm run test:e2e`.
2. Delegue ao subagente `auditor-paridade` a comparação item a item: `legacy/site.html` (dados, templates, CSS,
   comportamentos do JS: tema, rotas, agora/próximo, popup, fala, cópia, armazenamento, intenções) e
   `legacy/roteiro-doc.md` × `docs/SPEC.md` × código em `src/`. Peça uma tabela: item do legado · onde está no app ·
   status (ok / faltando / diferente) · evidência (arquivo:linha).
3. Tire capturas do app novo iguais às de `legacy/screenshots/` (390×844, deviceScaleFactor 2, mesmo dia/hora/tema;
   use o Playwright do projeto) e compare lado a lado; liste diferenças visuais relevantes.
4. Registre o relatório em `docs/PROGRESS.md` → "Auditoria de paridade".
5. Corrija cada lacuna (um commit por lacuna, `fix(paridade): …`), rodando `npm run check:all` a cada uma.
