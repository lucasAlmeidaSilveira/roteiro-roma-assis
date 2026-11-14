---
name: roteiro
description: Aplica uma mudança de conteúdo do roteiro pedida pelo Lucas (horário, lugar, item novo ou removido, resumo, dica, pendência, hospedagem) e publica no site. Edita src/data, libera a paridade, roda npm run check, registra em PROGRESS.md, faz o commit e envia direto para a main (a Vercel publica sozinha). Use sempre que o Lucas pedir para mudar, acrescentar ou tirar algo do roteiro, mesmo sem digitar /roteiro.
argument-hint: [a mudança, em português]
---

Aplique e publique esta mudança no roteiro: **$ARGUMENTS**

O Lucas provavelmente está no celular, em Roma ou Assis, no meio da viagem (14–24/11/2026). Seja direto:
pergunte só se não der para saber de qual dia ou item ele fala; senão, assuma o mais provável, faça e diga
o que assumiu. Responda em pt-BR, curto.

## 1. Entender (sem editar)

- Localize o que muda em `src/data/`:
  - `days.json` — o dia a dia: por dia `title`, `summary`, `note`, `alert`, `details` (`intro`, `tips`) e os
    `items` (`start`, `label`, `place`, `action`, `cost`, `mapQuery`, `phrases`, `event`, `paid`).
  - `todo.json` (pendências da aba Infos), `doc.json` (documento: visão geral, decisões, resumo por dia,
    como se locomover, hotéis, orçamento), `stays.json`, `tickets.json`, `infos.json`, `phrases.json`,
    `event.json` (programa oficial da Convenção: só mude se o Lucas pedir expressamente).
- Imprima o dia inteiro antes de mexer, por exemplo:
  `node -e "const d=require('./src/data/days.json').find(d=>d.day===14);console.log(JSON.stringify(d,null,2))"`.
- Procure **reflexos** da mesma informação em outros lugares: `summary`, `note`, `details.intro` e
  `details.tips` do dia; `todo.json`; `doc.json` (decisões e resumo por dia); `infos.json`. Use
  `grep -rn "<palavra-chave>" src/data`. O que mudou de fato tem que mudar em todos eles, para o app não se
  contradizer.
- Os esquemas estão em `src/lib/schema.ts`. Nunca afrouxe um esquema para o dado passar: corrija o dado.

## 2. Editar os dados

Siga `.claude/rules/dados.md`. Em especial:

- **Ids estáveis e sequenciais:** item `"{dia}-{índice}"` na ordem do array (`14-0`, `14-1`, …), `todo-N`,
  `decisao-N`. São as chaves do "Feito" salvo no celular do Lucas.
- **Mudar um item existente** (horário, lugar, ação, custo): edite no lugar, mantendo o `id`.
- **Acrescentar ou remover item:** insira na posição cronológica correta e **renumere os ids do dia** para
  continuarem sequenciais. Avise o Lucas na resposta que os "Feitos" marcados daquele dia podem ter mudado de
  item. Depois ajuste o inventário em `tests/unit/data.test.ts` (quantidade de itens por dia e o total; o
  mesmo para `todo`, `tickets`, etc.). Esse é o **único** caso em que esse teste pode ser editado: o conteúdo
  mudou de propósito, a pedido do Lucas. Nada em `tests/e2e/` muda.
- **Formatos:** `start` é `"HH:MM"` (hora de Roma) ou `null` quando é "a confirmar"; `label` segue o padrão
  do dia (`"09h15"`, `"~07h00"`, `"01h30–05h40"`); `cost` é `"—"`, `"grátis"` ou `"€6"`; `mapQuery` é o que se
  digitaria no Google Maps (sem ele o item não tem link de mapa nem entra em Lugares); `phrases` precisa ser
  uma chave que exista em `phrases.json` (liste com
  `node -e "console.log(Object.keys(require('./src/data/phrases.json')).join(' '))"`); `event: true` só para
  compromisso oficial da Convenção; `paid: true` só para ingresso pago.
- **Texto:** pt-BR, no mesmo tom dos vizinhos; marcação só `**negrito**` e `[texto](https://…)`. Nunca
  dados pessoais: códigos de bilhete, nomes completos de hóspedes, e-mails, telefones.
- Antes de renomear um `place`, rode `grep -rn "<nome atual>" tests/e2e`: um ou outro teste cita um lugar
  pelo nome (ex.: "Museus do Vaticano e Capela Sistina"). Se citar, mantenha o nome e mude só o resto.

## 3. Liberar a paridade com o site antigo

O conteúdo foi migrado do site original com prova (`npm run parity`). Uma mudança deliberada aparece como
problema até ser liberada:

1. Rode `npm run parity`. Cada linha `- dia 14: summary diferente`, `- item 14-2: action diferente (…)`,
   `- pendência 0 diferente`, `- documento: texto ausente "…"` que vier da mudança pedida vira uma entrada em
   `scripts/parity-exceptions.json`:
   `{ "alvo": "<começo da mensagem, ex.: item 14-2:>", "motivo": "<o que mudou>. Pedido do Lucas em AAAA-MM-DD." }`
   Use o mesmo `motivo` para todas as entradas da mesma mudança.
2. Nunca "resolva" a paridade voltando o conteúdo ou mexendo em `legacy/` (somente leitura).
3. Se aparecer um problema que **não** vem do pedido do Lucas, você quebrou algo sem querer: desfaça essa
   parte.

## 4. Verificar

- `npm run checklist` (regenera `docs/ACCEPTANCE_CHECKLIST.md` a partir dos dados).
- `npx prettier --write` nos arquivos que você tocou (o CI roda `npm run format:check`).
- `npm run check` — lint, tipos, unitários (inclui os esquemas Zod e o inventário) e paridade. Tem que ficar
  verde. Se acrescentou ou removeu item, rode também `npm run build`: é o mesmo build da Vercel.
- Não publique com algo vermelho. Se não conseguir deixar verde sem violar as regras acima, pare, mostre a
  saída e explique ao Lucas o que falta.

## 5. Registrar

Em `docs/PROGRESS.md` → seção **"Mudanças de conteúdo"**, acrescente um item com a data de hoje, o que mudou,
os arquivos tocados e quantas exceções de paridade entraram. Duas a quatro linhas bastam.

## 6. Publicar direto na `main`

A Vercel publica o que chega na `main`. Faça o commit e envie para lá, mesmo que a sessão esteja em outro
branch:

```bash
git add -A
git commit -m "feat(roteiro): <resumo curto da mudança>"
git fetch origin main
git rebase origin/main
git push origin HEAD:main
```

- Mensagem de commit em pt-BR, só com a mudança. **Sem** linha `Co-Authored-By` e sem mencionar o Claude.
  Não altere autor nem committer (a identidade do Lucas já está configurada).
- Se o push for recusado por a `main` ter andado, rode `git pull --rebase origin main` e envie de novo.
  Nunca `--force`.

## 7. Responder

Em três a cinco linhas: o que mudou e onde (dia e itens), o que você assumiu, se os "Feitos" do dia podem ter
mudado de lugar, e que a Vercel publica em um a dois minutos — para ver, fechar e abrir o app de novo (ou puxar
a página para atualizar).
