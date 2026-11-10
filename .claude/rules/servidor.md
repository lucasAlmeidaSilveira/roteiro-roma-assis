---
paths:
  - 'src/server/**'
  - 'src/app/api/**'
---

# Regras para servidor e API

- Todo arquivo em `src/server/` começa com `import 'server-only'`.
- Nenhuma variável de ambiente é obrigatória (D-16). As opcionais (`INTENCOES_GID`, `INTENCOES_FIXTURE`) são
  lidas sob demanda, nunca no import (o build precisa funcionar sem elas).
- Intenções: lidas pelo export em CSV da planilha (`sheetUrl` em `src/data/intentions.json`, compartilhada como
  "qualquer pessoa com o link"), com `fetch(..., { cache: 'no-store' })` e o leitor `src/lib/csv.ts`. Sem chave,
  sem conta de serviço, sem dependência do Google.
- Respostas da API com `Cache-Control: private, no-store`; erros com códigos estáveis (`not_configured`,
  `forbidden`, `upstream`), sem detalhes internos.
- Sem sessão nem código de acesso (D-15): a aba Intenções é aberta a quem tem o link. Não crie cookies.
- Intenções nunca vão para log, cache ou resposta de erro. Modo fixture só com `INTENCOES_FIXTURE=1` e
  `VERCEL !== "1"`.
