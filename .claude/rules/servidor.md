---
paths:
  - 'src/server/**'
  - 'src/app/api/**'
---

# Regras para servidor e API

- Todo arquivo em `src/server/` começa com `import 'server-only'`.
- Variáveis de ambiente validadas com Zod **sob demanda** (`getGoogleEnv()`), nunca no import (o build precisa
  funcionar sem elas). Ausentes → 503 `not_configured`.
- Respostas da API com `Cache-Control: private, no-store`; erros com códigos estáveis (`not_configured`,
  `forbidden`, `upstream`), sem detalhes internos.
- Sem sessão nem código de acesso (D-15): a aba Intenções é aberta a quem tem o link. Não crie cookies.
- Intenções nunca vão para log, cache ou resposta de erro. Modo fixture só com `INTENCOES_FIXTURE=1` e
  `VERCEL !== "1"`.
- Google: `google-auth-library` `JWT` com escopo `spreadsheets.readonly`; `GOOGLE_PRIVATE_KEY` com `\n` convertidos.
