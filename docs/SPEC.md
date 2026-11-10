# SPEC — Roteiro Roma e Assis (app web)

Versão 1.0 · 10/11/2026 · fonte: varredura completa do site original (`legacy/site.html`, versão 24), do documento
"Roteiro Roma e Assis — 14 a 24 de novembro de 2026" (`legacy/roteiro-doc.md`) e da programação oficial da Convenção.

Este documento diz **o que** o app faz. A ordem de construção está em `IMPLEMENTATION_PLAN.md`; a forma, em
`DESIGN.md`; a estrutura técnica, em `ARCHITECTURE.md`. Cada requisito tem um ID (RF = funcional, RNF = não
funcional) e aponta para os testes que o verificam. **Os testes de `tests/e2e` passam no site original**
(`npm run test:e2e:legacy`), então eles são a definição executável de "paridade".

## 1. Contexto

- **Quem usa:** Lucas, no iPhone 15 (navegador Arc, motor WebKit; às vezes Safari), durante a viagem de 14 a
  24/11/2026 — Convenção Shalom 45 anos em Roma e Assis. Em segundo plano, os dois amigos do grupo.
- **Para quê:** abrir o celular e saber, sem pensar, o que fazer agora, o que vem depois, como chegar, quanto
  custa, o que falar em italiano/inglês, e onde dormir. Também receber e ler as intenções de oração que as pessoas
  mandam pelo Google Forms.
- **Condições reais:** sol forte, uma mão ocupada, internet ruim ou ausente (roaming), cansaço, pressa.
- **Princípios:** celular primeiro · legível (fonte Atkinson Hyperlegible) · funciona offline · nada se perde do
  original · privado (fora dos buscadores; intenções só para o dono) · sem login para o roteiro.

## 2. Escopo

**Dentro:** tudo o que o site original faz (RF-01 a RF-12) + o conteúdo que só existia no documento (RF-13) +
backend próprio para as intenções (RF-14/15) + app instalável e offline (RF-16) + qualidade (RNF).

**Fora:** editar o roteiro pelo app (o conteúdo muda em `src/data`), contas de usuário, outros idiomas de
interface (a UI é pt-BR), notificações push, analytics.

## 3. Rotas

| Rota                                                     | O que é                                                         | Render                                    |
| -------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| `/`                                                      | Abre o dia de hoje (horário de Roma) ou o dia 14 fora da viagem | estática + redirecionamento no cliente    |
| `/dia/14` … `/dia/23`                                    | Um dia do roteiro                                               | estática (SSG), 10 páginas                |
| `/dia/qualquer-outra-coisa`                              | "Página não encontrada"                                         | sob demanda                               |
| `/lugares`                                               | Todos os lugares por dia, com mapa e ingresso oficial           | estática                                  |
| `/infos`                                                 | Infos práticas + conteúdo do documento                          | estática                                  |
| `/intencoes`                                             | Intenções recebidas (só o dono)                                 | casca estática + dados via API no cliente |
| `/api/intencoes`                                         | GET: lê a planilha (exige sessão)                               | dinâmica, `no-store`                      |
| `/api/sessao`                                            | POST entra / DELETE sai                                         | dinâmica                                  |
| `/manifest.webmanifest`, `/robots.txt`, `/sw.js`, ícones | PWA e privacidade                                               | estáticos                                 |

O site original usava `#dia-14`, `#lugares`… (hash). O app novo usa caminhos; não precisa aceitar hash.

## 4. Requisitos funcionais

### RF-01 · Casca: cabeçalho, navegação, rodapé — testes `01-layout`

1. Cabeçalho fixo no topo (sticky), fundo `--surface`, borda inferior `--line`, respeita a área segura do iPhone
   (`env(safe-area-inset-*)`), com uma faixa de `--surface` cobrindo a área do notch.
2. Linha da marca: `<h1>` **"Roma e Assis"** (não quebra linha) + data **"14–24 nov 2026"** (escondida em telas
   ≤ 430 px) + chave de tema (RF-02).
3. Navegação de seções: `<nav aria-label="Seções">` com 4 links, nesta ordem: **Dia a dia** (`/`), **Lugares**,
   **Intenções**, **Infos**. O link da seção atual tem `aria-current="page"` ("Dia a dia" fica ativo em `/dia/*`).
   Visual de "segmented control" (DESIGN §4.3).
4. Navegação de dias: `<nav aria-label="Dias da viagem">` com 10 links (14 a 23), rolagem horizontal com snap,
   sem barra de rolagem visível. Cada chip mostra o dia da semana (pequeno, maiúsculo) e o número (grande).
   - Nome acessível: `"{weekday} {day} de novembro"`, ex.: **"Sáb 14 de novembro"**; no dia de hoje, acrescenta
     **" (hoje)"**.
   - O texto visível precisa ter espaço entre dia da semana e número (`Sáb 14`), para o nome visível estar contido
     no nome acessível (WCAG 2.5.3).
   - Chip do dia aberto: `aria-current="true"` (ou `"page"`), fundo `--accent`.
   - Chip de hoje (quando não é o aberto): borda de 2 px `--accent`.
   - Ao abrir um dia, o chip ativo rola para o centro (`scrollIntoView({block:'nearest', inline:'center'})`).
   - Fora de `/dia/*`, nenhum chip fica ativo.
5. Rodapé (fora do `<main>`), texto exato de `ui.footer`.
6. `/`: no cliente, calcula o dia de hoje em Roma (`tripState`) e faz `router.replace('/dia/{dia ou 14}')`.
   Antes disso mostra "Abrindo o dia de hoje…" e links para os 10 dias (funciona sem JavaScript).
7. Rotas com `<main>` e cabeçalho da página (eyebrow + `<h2>`) já na Fase 1: `/dia/[dia]` (título do dia),
   `/lugares` ("Todos os lugares"), `/infos` ("Infos práticas"), `/intencoes` ("Intenções").
8. Dia inexistente → página "Página não encontrada" (`ui.notFound`), com link para `/` e `noindex`.

### RF-02 · Tema claro/escuro — testes `01-layout`

1. Botão `role="switch"` com `aria-label="Tema escuro"` e `aria-checked` = tema escuro ativo; mostra o rótulo
   visível **"Claro"** ou **"Escuro"** + trilho com bolinha (DESIGN §4.2).
2. Sem escolha salva, segue o sistema (`prefers-color-scheme`) e acompanha mudanças do sistema ao vivo.
3. Clique alterna, aplica `data-theme="dark|light"` no `<html>` e salva em `localStorage["roteiro-roma-tema"]`.
4. Sem "flash": o tema salvo é aplicado por script inline no `<head>` antes da pintura (`THEME_INIT_SCRIPT`,
   já pronto em `src/lib/theme.ts`).

### RF-03 · Página do dia — testes `02-dia`

Ordem dos blocos (de cima para baixo):

1. **Contagem regressiva** (só antes da viagem, calculada no cliente): `ui.day.countdownOne/Other` com `{n}` =
   `daysUntilTrip(agora)` quando > 0. Ex.: "A viagem começa em 4 dias. Abra esta página em Roma para ver o que está
   acontecendo agora." Estilo "nota".
2. **Cabeçalho do dia:** eyebrow `"{weekday} · {day} de novembro"` (maiúsculas via CSS), `<h2>` com o título,
   parágrafo com o resumo (`summary`), chips: cidade (negrito) e, se houver, `"{n} compromisso(s) da Convenção"`.
3. **Alerta** (dias 19, 20 e 21): caixa com `<strong>{alert.title}</strong> {alert.body}`.
4. **Agora/Próximo** (RF-04), só no dia de hoje.
5. **Linha do tempo:** `<ol>` com um cartão por item (RF-05), na ordem dos dados.
6. **Nota** do dia (dias 14, 16 e 18), estilo "nota".
7. **Mais detalhes do roteiro** (conteúdo do documento, RF-13.1): `<details>` fechado com `<summary>` "Mais
   detalhes do roteiro", contendo a introdução e as dicas do documento, com **negrito** e links renderizados.
8. **Onde dormir:** eyebrow "Onde dormir", nome (negrito), endereço, `when` (cinza, menor) e link "Mapa ↗"
   quando a hospedagem tem `mapQuery`.

### RF-04 · "Agora / Próximo" — testes `03-agora`

1. Só aparece quando o dia aberto é o dia de hoje em Roma (`tripState(agora).day === dia`). A madrugada e o dia 24
   contam como dia 23 (minutos + 1440).
2. Container `role="status"`:
   - rótulo `"Hoje · {hh}h{mm} em Roma"` (ex.: "Hoje · 10h05 em Roma");
   - se já começou algum item: `"Agora: {place}"` (negrito) + a `action` do item (cinza);
   - se há próximo: **"Próximo:"** + `" {place} às {HHhMM} (em {duração})"`, duração `formatDuration`
     ("1h 25 min", "40 min");
   - senão: "Nada mais programado hoje."
3. Itens sem horário (`start: null`) são ignorados no cálculo. Lógica pronta e testada: `nowNext()` em
   `src/lib/time.ts`.
4. O cartão do item em andamento recebe destaque (contorno `--accent`) e `aria-current="time"`.
5. Atualiza sozinho quando o minuto muda (hook `useNow`, já pronto). Nada disso é renderizado no servidor.

### RF-05 · Cartão de item — testes `02-dia`

Cada item é `<li id="it-{id}">` (ex.: `it-14-0`; o id é contrato dos testes e âncora de link). Contém:

1. **Horário** (`label`), fonte mono, cinza, coluna fixa de 64 px (76 px em ≥ 600 px).
2. **Lugar** (`place`) em negrito e **o que fazer** (`action`).
3. Linha de ações, nesta ordem:
   - selo **"Convenção"** se `event` (e o cartão ganha fundo `--accent-soft` + barra lateral `--accent`);
   - chip de custo se `cost !== "—"`; se `paid`, chip dourado com prefixo **"Ingresso "** (ex.: "Ingresso €25");
   - link **"Mapa ↗"** se `mapQuery` (Google Maps, nova aba, `rel="noopener"`, `mapUrl()`);
   - botão **"Idiomas"** com a etiqueta "IT · EN" (`aria-hidden`), `aria-haspopup="dialog"` → abre RF-07;
   - caixa **"Feito"** alinhada à direita (RF-06).
4. Item feito: opacidade 0,55 e lugar riscado.

### RF-06 · "Feito" salvo no aparelho — testes `02-dia`, `06-infos`

1. Mapa em `localStorage["roteiro-roma-feitos-v1"]`, formato `{"14-0":1,"todo-3":1,"decisao-2":1}` (mesmo do
   original). Hooks prontos: `useDoneMap()`.
2. Vale para itens do roteiro, pendências "Antes de viajar" e "Decisões em aberto".
3. Se o navegador bloquear o armazenamento, continua funcionando em memória até fechar a aba (já tratado em
   `src/lib/storage.ts`).
4. O rodapé avisa que fica "só neste aparelho" (texto do RF-01.5).

### RF-07 · Popup "Idiomas" (italiano e inglês) — testes `04-idiomas`

1. Abre a partir do botão "Idiomas" de qualquer item, com o conjunto de frases do item (`item.phrases`). Diálogo
   modal (`<dialog>` nativo com `showModal()` ou `role="dialog"` + `aria-modal="true"`), rotulado pelo título do
   conjunto (ex.: "Museus do Vaticano"); subtítulo = lugar do item.
2. **Troca de idioma:** grupo `aria-label="Idioma das frases"` com dois botões, **"Italiano"** e **"English"**,
   `aria-pressed`. A escolha fica em `localStorage["roteiro-roma-idioma"]` e vale para todos os popups. Trocar o
   idioma para qualquer fala em andamento.
3. **Lista de frases** do conjunto no idioma escolhido; cada frase mostra: o texto (negrito, `lang="it"` ou
   `lang="en"`), a pronúncia aproximada (mono, cor `--accent`) e a tradução em português (cinza). À direita, dois
   botões: **"Ouvir"** e **"Copiar"**.
4. **Ouvir:** usa `speak()` de `src/lib/speech.ts` (já pronto, com os ajustes do iPhone: recarregar vozes, cancelar e
   esperar 150 ms, `resume()` antes, taxa 0,9, `it-IT`/`en-US`). Enquanto toca, o botão mostra **"Tocando…"**.
   Se a fala não começar em 2,5 s ou falhar, aparece na linha o link **"Sem áudio neste navegador. Ouvir no
   Google Tradutor ↗"** (`translateUrl()`).
5. **Copiar:** copia o texto da frase; o botão mostra **"Copiado"** por 1,5 s. Se a área de transferência for
   negada, seleciona o texto da frase para cópia manual.
6. Seção **"Sempre úteis"** (eyebrow) com o conjunto `basic` no mesmo idioma, mesmas ações.
7. Dica fixa no fim: `ui.phrases.tip` (modo silencioso do iPhone, como ler a pronúncia, Buongiorno/Buonasera).
8. Fechar: botão **"Fechar"** (✕, alvo de 44 px), tecla Esc e toque fora (backdrop). Ao abrir, o foco vai para o
   botão Fechar; ao fechar, volta para o botão "Idiomas" que abriu. A página atrás não rola enquanto aberto.
9. Visual: folha que sobe de baixo no celular (cantos 16 px em cima, até 88 % da altura); centralizado em
   ≥ 600 px (até 80 %). Fundo escurecido.
10. Os 28 conjuntos (115 frases IT + 115 EN) precisam abrir completos — há um teste por conjunto.

### RF-08 · Lugares — testes `05-lugares`

1. Cabeçalho: eyebrow "Resumo", `<h2>` "Todos os lugares", introdução `ui.places.intro` (aviso de sites falsos).
2. Um `<section>` por dia com `<h3>` contendo um link para o dia: `"{weekday} {day} · {title}"`.
3. Lista do dia = `placesForDay(day, tickets)` (já pronto): só itens com mapa, sem deslocamentos (lugar com "→"),
   sem repetir lugar no mesmo dia. Cada linha: nome do lugar; chip dourado com o custo se for ingresso pago; se o
   lugar tem ingresso oficial (`tickets.json`), botão dourado **"{label} ↗"** (nova aba) + a nota abaixo; à direita,
   link **"Mapa ↗"**.
4. No fim (conteúdo do documento, RF-13.2): `<details>` "Resumo por dia" com a tabela Dia · Lugares · Ingresso
   pago, a introdução e a legenda.

### RF-09 · Infos práticas — testes `06-infos`

Eyebrow "Para consultar", `<h2>` "Infos práticas". Cartões, nesta ordem:

1. **Antes de viajar** — 9 pendências (`todo.json`) como caixas de seleção com o texto como nome acessível;
   marcação salva (RF-06).
2. **Hospedagens** — 4 linhas (`infos.stays.items`): título em negrito, texto, e "Mapa ↗" quando há `stay` com
   `mapQuery` (Olympic e Locanda).
3. **Transporte em Roma** — tabela chave/valor (valor à direita, negrito, números tabulares) + nota.
4. **Orçamento por pessoa** — tabela chave/valor.
5. **Lembretes** — lista; "**112**" em negrito (marcação `**` dos dados).
6. Conteúdo do documento (RF-13.3), em `<details>` para a página continuar escaneável.

### RF-10 · Intenções (interface) — testes `07-intencoes`

A página é uma casca estática; os dados vêm de `GET /api/intencoes` no cliente (ao abrir e ao tocar "Atualizar").

1. Cabeçalho: eyebrow "Para rezar", `<h2>` "Intenções", parágrafo `ui.intentions.lead`.
2. **Não entrou (401):** troca o parágrafo por "Esta aba é só para o dono do roteiro." e mostra o formulário de
   acesso: campo com rótulo **"Código de acesso"** (`type="password"`, `autocomplete="current-password"`) e
   botão **"Entrar"**. Erro: "Código incorreto. Tente de novo." Não mostra intenções nem a mensagem.
3. **Entrou:** cartão "Intenções recebidas":
   - título vira `"{n} intenção recebida"` / `"{n} intenções recebidas"`;
   - status: "Carregando…" → `"Atualizado às {HH:MM}. As mais novas no topo."` (hora local, pt-BR);
   - lista `<ol>` (rolagem própria até 60 vh): texto da intenção (quebras de linha preservadas, quebra palavras
     longas) + linha cinza `"{nome} · {data/hora}"` com o que existir;
   - vazio: `ui.intentions.empty`; erros: `notConfigured` (503), `forbidden` (502/403), `error` com `{code}`;
   - botões **"Atualizar"** e **"Sair"**.
4. **Mensagem para enviar** (só entrou): `<textarea readonly aria-label="Mensagem para enviar">` com
   `messageTemplate` preenchido com o link do formulário; botão **"Copiar mensagem"** → status "Mensagem copiada.
   Cole no WhatsApp." (ou seleciona o texto: "Texto selecionado: toque em Copiar.").
5. **Onde levar as intenções** (sempre visível): lista `intentions.where`.
6. Intenções são privadas: nunca entram no HTML estático, no cache do service worker, em logs ou em analytics.

### RF-11 · Sessão do dono — testes `07-intencoes`

1. `POST /api/sessao` com JSON `{ "passcode": "..." }`. Compara com `OWNER_PASSCODE` em tempo constante
   (`crypto.timingSafeEqual` sobre hashes SHA-256). Errado → 401 `{ "error": "invalid" }` após ~400 ms de atraso.
2. Certo → 204 + cookie `rr_sessao` = JWT HS256 (`jose`, segredo `AUTH_SECRET` ≥ 32 caracteres, `sub: "owner"`,
   validade 30 dias), `HttpOnly`, `Secure` em produção, `SameSite=Lax`, `Path=/`, `Max-Age` 30 dias.
3. Só aceita `Content-Type: application/json` e `Origin` igual ao host (proteção CSRF); senão 403.
4. `DELETE /api/sessao` apaga o cookie (204).

### RF-12 · API de intenções — testes `07-intencoes`

1. `GET /api/intencoes`: sem sessão válida → 401 `{ "error": "unauthorized" }`.
2. Com sessão: lê `INTENCOES_RANGE` (padrão `A1:Z2000`) da planilha `INTENCOES_SHEET_ID` com a conta de serviço
   (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, escopo `spreadsheets.readonly`, `google-auth-library`),
   interpreta com `parseIntentionRows()` (pronto) → 200 `{ "items": [...], "fetchedAt": "ISO" }`.
3. Erros: variáveis ausentes → 503 `{ "error": "not_configured" }`; Google 403/404 → 502
   `{ "error": "forbidden" }`; outros → 502 `{ "error": "upstream" }`. Nunca vazar detalhes internos.
4. Todas as respostas com `Cache-Control: private, no-store`.
5. **Modo de teste:** com `INTENCOES_FIXTURE=1` e fora da Vercel (`VERCEL !== "1"`), lê
   `tests/fixtures/intencoes.json` (dados fictícios) em vez do Google.
6. A planilha real é a das respostas do formulário (aba "Respostas ao formulário 1", colunas "Carimbo de
   data/hora", "Sua intenção ", "Seu nome").

### RF-13 · Conteúdo que só existia no documento — testes `02-dia`, `05-lugares`, `06-infos` (@novo)

1. Por dia (`days[].details`): introdução + dicas (RF-03.7). Dias 14, 15, 16, 17, 18, 19, 20, 21 e 23.
2. Lugares: tabela "Resumo por dia" (`doc.placesSummary`) (RF-08.4).
3. Infos (`doc.json`, `event.json`), cada um num `<details>` com título:
   - **Visão geral e alertas** — `lead`, itens `"**{title}** {text}"`, `premise`;
   - **Como se locomover em Roma** — introdução, tabela Trajeto · Como ir · Tempo, parágrafo de preços;
   - **Hospedagem barata em Roma (22→23/11)** — introdução, nota, as 5 opções (nome, nota, preço, por que), extra e
     sugestão;
   - **Programação da Convenção** — os 7 dias (título, tema, horários) e os convidados;
   - **Decisões em aberto** — 10 caixas de seleção, já marcadas as que estão `done: true`; marcação salva
     (`decisao-N`, RF-06);
   - **Como o orçamento foi calculado** — introdução, tabela categoria/faixa, nota;
   - **Fontes consultadas** — nota + 26 itens com os links (nova aba).
4. Todo texto com `**negrito**` ou `[texto](https://…)` é renderizado com `parseInline()` (pronto) — nunca como
   HTML cru.

### RF-14 · Privacidade — testes `09-qualidade`

1. Fora dos buscadores: `<meta name="robots" content="noindex, nofollow">`, cabeçalho `X-Robots-Tag`,
   `robots.txt` com `Disallow: /`.
2. Nenhum dado pessoal no repositório: nomes completos dos hóspedes, código de bilhete, e-mails, telefones,
   localizadores de voucher, intenções reais (o teste `data.test.ts` verifica parte disso).
3. Sem analytics, sem cookies além da sessão do dono.

### RF-15 · App instalável e offline — testes `08-pwa`

1. `app/manifest.ts`: `name` "Roma e Assis 2026", `short_name` "Roma e Assis", `start_url` "/", `display`
   "standalone", `lang` "pt-BR", `background_color` `#eef0ec`, `theme_color` `#2c5a86`, ícones 192 e 512 (normais e
   `maskable`, já em `public/icons`). `apple-icon.png` e `icon.png` já estão em `src/app`.
2. Offline: `public/sw.js` (pronto e validado) guarda as 14 rotas e os arquivos `/_next/static` na instalação;
   navegação = rede primeiro com fallback ao cache (3,5 s); `/api/*` nunca vai para o cache.
3. Registro do service worker só em produção, num componente cliente no layout.
4. `/sw.js` servido com `Cache-Control: no-cache` e `Service-Worker-Allowed: /`.
5. Critério: depois de uma visita com internet, com o aparelho offline, abrir `/`, qualquer `/dia/N`, `/lugares` e
   `/infos` funciona.

### RF-16 · Conteúdo como dados — testes `tests/unit/data.test.ts` + `npm run parity`

1. Todo conteúdo vem de `src/data/*.json`, validado por Zod (`src/lib/schema.ts`) no build.
2. Componentes nunca contêm texto do roteiro; textos fixos da interface vêm de `src/data/ui.json` (via
   `src/lib/copy.ts`).
3. `npm run parity` prova que os JSON contêm tudo do site e do documento originais (1.507 comparações).

## 5. Requisitos não funcionais

| ID     | Requisito                                                                                                                                                                                                                                          | Como verificar                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| RNF-01 | Acessibilidade WCAG 2.1 AA: axe sem problemas "serious"/"critical" em todas as páginas e no popup, nos dois temas; foco visível (3 px `--accent`); alvos de toque ≥ 32 px (ações) e 44 px (botões principais); `prefers-reduced-motion` respeitado | `09-qualidade`                                                          |
| RNF-02 | Sem erros no console (inclui erros de hidratação) em todas as rotas                                                                                                                                                                                | `09-qualidade`                                                          |
| RNF-03 | Desempenho em celular médio 4G: LCP < 2,5 s, CLS < 0,1, INP < 200 ms; JS de primeira carga da página do dia ≤ 180 kB (gzip)                                                                                                                        | Lighthouse mobile ≥ 90 em Performance e Acessibilidade (manual, Fase 9) |
| RNF-04 | Funciona sem JavaScript para ler o roteiro (SSG); interações (Feito, popup, agora) exigem JS                                                                                                                                                       | manual                                                                  |
| RNF-05 | Segurança: cabeçalhos `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`; sem `X-Powered-By`; segredos só em variáveis de ambiente; cookie de sessão `HttpOnly`                                            | `09-qualidade`                                                          |
| RNF-06 | Navegadores: iOS Safari/Arc (WebKit) 17+, Chrome Android, desktop recentes                                                                                                                                                                         | manual no iPhone (Fase 10)                                              |
| RNF-07 | Qualidade de código: TypeScript estrito sem `any`, ESLint sem avisos, Prettier, testes unitários para lógica, CI verde                                                                                                                             | `npm run check:all`, GitHub Actions                                     |
| RNF-08 | Horário sempre de Roma (`Europe/Rome`), independente do fuso do aparelho                                                                                                                                                                           | `tests/unit/time.test.ts`, `03-agora`                                   |

## 6. Contratos usados pelos testes (não mudar sem mudar os testes)

| Elemento         | Contrato                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marca            | `heading` nível 1 "Roma e Assis"                                                                                                                                                    |
| Seções           | `navigation` "Seções" → 4 `link`; ativo com `aria-current="page"`                                                                                                                   |
| Dias             | `navigation` "Dias da viagem" → 10 `link` com nome "Sáb 14 de novembro" (+ " (hoje)"); ativo `aria-current="true"` ou `"page"`                                                      |
| Tema             | `switch` "Tema escuro" com `aria-checked`; texto "Claro"/"Escuro"; `html[data-theme]`                                                                                               |
| Título da página | `heading` nível 2 (título do dia / "Todos os lugares" / "Infos práticas" / "Intenções")                                                                                             |
| Item             | `li#it-{dia}-{índice}` com 1 `checkbox`, 1 `button` "Idiomas", `link` "Mapa ↗" se houver mapa; item atual `aria-current="time"`                                                     |
| Agora            | `status` contendo "Hoje · HHhMM em Roma"                                                                                                                                            |
| Popup            | `dialog` com nome = título do conjunto; `button` "Italiano"/"English" com `aria-pressed`; `button` "Ouvir"/"Tocando…", "Copiar"/"Copiado", "Fechar"; `link` de fallback do Tradutor |
| Lugares          | `section` com `heading` "{weekday} {day} · {title}" contendo `link` para `/dia/{day}`; `listitem` por lugar                                                                         |
| Infos            | `checkbox` com nome = texto da pendência/decisão                                                                                                                                    |
| Intenções        | campo rotulado "Código de acesso", `button` "Entrar"/"Atualizar"/"Sair"/"Copiar mensagem", `textbox` da mensagem                                                                    |
| Não encontrado   | `heading` "Página não encontrada" + `link` "Abrir o dia de hoje" → `/`                                                                                                              |

## 7. Melhorias deliberadas em relação ao site original

1. Rotas com caminho (`/dia/14`) em vez de hash; páginas estáticas (rápidas e indexáveis por nós, não pelos
   buscadores).
2. Intenções com backend próprio (conta de serviço do Google + sessão por código) em vez do conector do Claude, que
   só funcionava dentro do app do Claude.
3. Offline completo e instalável na tela inicial.
4. Fontes self-hosted (não dependem do Google Fonts nem de internet).
5. Conteúdo do documento dentro do app (RF-13).
6. Acessibilidade: nomes visíveis contidos nos nomes acessíveis dos chips, rótulo na mensagem, `lang` nas frases,
   `aria-current="time"` no item atual.

## 8. Matriz de rastreabilidade

| Requisito                    | Fase | Testes                                                              |
| ---------------------------- | ---- | ------------------------------------------------------------------- |
| RF-01, RF-02                 | 1    | `tests/e2e/01-layout.spec.ts`                                       |
| RF-03, RF-05, RF-06, RF-13.1 | 2    | `tests/e2e/02-dia.spec.ts`                                          |
| RF-04                        | 3    | `tests/e2e/03-agora.spec.ts`, `tests/unit/time.test.ts`             |
| RF-07                        | 4    | `tests/e2e/04-idiomas.spec.ts`, `tests/unit/storage-speech.test.ts` |
| RF-08, RF-13.2               | 5    | `tests/e2e/05-lugares.spec.ts`, `tests/unit/places-links.test.ts`   |
| RF-09, RF-13.3               | 6    | `tests/e2e/06-infos.spec.ts`                                        |
| RF-10, RF-11, RF-12          | 7    | `tests/e2e/07-intencoes.spec.ts`, `tests/unit/intentions.test.ts`   |
| RF-15                        | 8    | `tests/e2e/08-pwa.spec.ts`                                          |
| RF-14, RNF-01..08            | 9    | `tests/e2e/09-qualidade.spec.ts`                                    |
| RF-16                        | 0    | `tests/unit/data.test.ts`, `npm run parity`                         |
