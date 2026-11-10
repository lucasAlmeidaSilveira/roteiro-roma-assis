---
paths:
  - 'src/data/**'
  - 'scripts/**'
  - 'tests/unit/data.test.ts'
---

# Regras para dados de conteúdo

- `src/data/*.json` é a fonte da verdade e foi migrado do site original com prova (`npm run parity`). Só mude com
  pedido explícito do Lucas.
- Mantenha ids estáveis: item `"{dia}-{índice}"`, `todo-N`, `decisao-N` (são chaves do "Feito" salvo no celular).
- Qualquer mudança: rode `npm run check`; registre diferenças deliberadas em `scripts/parity-exceptions.json`
  (alvo + motivo + data) e em `docs/PROGRESS.md`; remoção exige ajustar o inventário em `tests/unit/data.test.ts`.
- Marcação permitida em textos: só `**negrito**` e `[texto](https://…)`.
- Nunca coloque dados pessoais (nomes completos de hóspedes, códigos de bilhete, e-mails, telefones, intenções).
