# Roteiro de prompts para o Claude Code

Copie e cole na ordem. Cada fase numa sessão limpa (`/clear` antes). O Claude Code lê o `CLAUDE.md` sozinho; os
prompts só apontam a fase e a verificação. Os atalhos `/fase`, `/paridade` e `/status` são skills deste projeto
(`.claude/skills/`) e fazem o mesmo que os prompts longos abaixo.

## Antes de começar (uma vez)

No terminal, dentro da pasta do projeto:

```bash
git init -b main         # antes do npm ci (ativa os hooks do Husky)
npm ci
npx playwright install --with-deps chromium
npm run check            # deve passar
npm run test:e2e:legacy  # deve passar: 66 testes no site antigo
claude
```

Na primeira abertura, aprove o servidor MCP `next-devtools` do `.mcp.json` (dá ao Claude a visão de erros do
`next dev`).

## Prompt 0 — Kickoff (Fase 0)

```text
Você é o dev sênior deste projeto. Leia CLAUDE.md, docs/SPEC.md, docs/ARCHITECTURE.md, docs/DESIGN.md e
docs/IMPLEMENTATION_PLAN.md, e olhe as imagens em legacy/screenshots/. Depois:
1. rode npm run check e npm run test:e2e:legacy e me mostre o resultado;
2. me diga, em até 10 linhas, o que entendeu do app e liste qualquer ponto da SPEC que pareça ambíguo
   ou em conflito com legacy/site.html (não invente: pergunte);
3. registre a Fase 0 em docs/PROGRESS.md e faça o commit "chore: kit inicial".
Não escreva código de interface ainda.
```

## Prompts das fases 1 a 9

Use o atalho:

```text
/fase 1
```

(depois `/fase 2`, `/fase 3`… até `/fase 9`, sempre com `/clear` entre elas).

Se preferir sem o atalho, este é o prompt completo (troque N):

```text
Vamos fazer a Fase N de docs/IMPLEMENTATION_PLAN.md.
Antes de codar, em plan mode: leia a fase, os requisitos da SPEC que ela cita, os testes em tests/e2e que ela
habilita e o trecho correspondente de legacy/site.html; me mostre um plano curto (arquivos, componentes
servidor/cliente, riscos).
Depois de eu aprovar:
- implemente seguindo CLAUDE.md, DESIGN.md e ARCHITECTURE.md (leia o guia do Next em
  node_modules/next/dist/docs/ antes de usar qualquer API do Next);
- acrescente N em tests/fases.json;
- rode npm run check:all e itere até ficar tudo verde — mostre a saída final dos testes;
- NÃO altere src/data, tests/e2e ou tests/unit/data.test.ts para fazer passar; se achar que um teste está
  errado, pare e me explique com evidência do legacy/site.html;
- use o subagente revisor no diff da fase e corrija o que for crítico;
- atualize docs/PROGRESS.md e faça o commit "feat(fase-N): <resumo>".
```

## Auditoria final (depois da Fase 9)

```text
/paridade
```

ou:

```text
Use o subagente auditor-paridade para comparar, item por item, legacy/site.html e legacy/roteiro-doc.md com o
app (docs/SPEC.md §4 e o código). Rode npm run parity, npm run test:e2e:legacy e npm run test:e2e.
Liste qualquer comportamento, texto ou detalhe visual do site antigo que não esteja no app, com arquivo e linha
de evidência. Depois corrija as lacunas, uma por commit.
```

## Se algo travar

- **Teste falhando sem sair do lugar (2 tentativas):** `/clear` e:
  ```text
  O teste <nome> da fase N falha com: <cole o erro>. Leia o teste, o requisito na SPEC e o trecho do
  legacy/site.html. Escreva primeiro por que falha (causa raiz), depois corrija sem mudar o teste.
  ```
- **Contexto cheio / sessão longa:** `/clear` e:
  ```text
  Leia docs/PROGRESS.md e continue a fase em andamento a partir do próximo passo registrado.
  ```
- **Erro só no navegador (hidratação, console):** com `npm run dev` rodando, peça:
  ```text
  Use o next-devtools (get_errors) para ver os erros de runtime da rota /dia/15 e corrija a causa.
  ```
- **Antes de compactar:** `/compact Preserve a fase atual, arquivos alterados, testes falhando e decisões.`

## Deixar o Claude trabalhar sozinho (opcional)

Para uma fase inteira sem você aprovar cada passo, defina uma condição de término verificável:

```text
/goal npm run check:all passa com a fase N habilitada em tests/fases.json e docs/PROGRESS.md atualizado
```

E rode `/fase N`. O Claude continua até a condição ser verdadeira (ou para e pergunta se travar).

## Publicação (Fase 10)

```text
Me guie no docs/DEPLOY.md passo a passo. Faça você o que for no terminal (git, gh, vercel CLI se instalada);
me diga exatamente o que eu preciso clicar no GitHub, na Vercel e no Google Cloud, um passo por vez,
esperando eu confirmar. Nunca me peça para colar segredos no chat: eu mesmo coloco na Vercel.
```

## Mudanças de conteúdo depois de pronto

```text
Atualize o roteiro: <ex.: o trem do dia 22 mudou para 11h05>. Altere só src/data (mantenha os ids), rode
npm run check. O npm run parity vai acusar a diferença com o site antigo: registre-a em
scripts/parity-exceptions.json (alvo + motivo + data). Se for remoção, ajuste o inventário em
tests/unit/data.test.ts. Rode npm run test:e2e e faça o commit "content: <resumo>".
```
