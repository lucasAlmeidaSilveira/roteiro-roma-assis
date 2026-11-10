---
paths:
  - 'tests/**'
  - 'playwright*.config.ts'
  - 'vitest.config.mts'
---

# Regras para testes

- `tests/e2e/*.spec.ts` são o contrato de paridade: passam no site original (`npm run test:e2e:legacy`). Não
  mude para fazer o app passar; se um teste estiver errado, prove com o `legacy/site.html` e peça confirmação.
- Testes só do app novo levam `@novo` no título (ficam fora da execução no site antigo).
- Habilitar fase = acrescentar o número em `tests/fases.json`.
- Seletores por papel e nome acessível (`getByRole`), ids de contrato (`#it-14-0`); nunca por classe CSS.
- Hora fixa: `page.clock.setFixedTime(new Date('2026-11-15T10:05:00+01:00'))` antes do `goto`.
- Dados de teste fictícios; nunca intenções reais.
