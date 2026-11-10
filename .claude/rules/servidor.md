---
paths:
  - 'src/server/**'
  - 'src/app/api/**'
---

# Regras para servidor e API

- Todo arquivo em `src/server/` começa com `import 'server-only'`.
- Variáveis de ambiente validadas com Zod **sob demanda** (`getServerEnv()`), nunca no import (o build precisa
  funcionar sem elas). Ausentes → 503 `not_configured`.
- Respostas da API com `Cache-Control: private, no-store`; erros com códigos estáveis (`unauthorized`, `invalid`,
  `not_configured`, `forbidden`, `upstream`), sem detalhes internos.
- Sessão: JWT HS256 (`jose`), cookie `rr_sessao` `HttpOnly`, `Secure` em produção, `SameSite=Lax`, 30 dias.
  Comparação do código em tempo constante; atraso ~400 ms no erro; POST/DELETE só JSON e `Origin` do host.
- Intenções nunca vão para log, cache ou resposta de erro. Modo fixture só com `INTENCOES_FIXTURE=1` e
  `VERCEL !== "1"`.
- Google: `google-auth-library` `JWT` com escopo `spreadsheets.readonly`; `GOOGLE_PRIVATE_KEY` com `\n` convertidos.
