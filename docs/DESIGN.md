# DESIGN — guia de bolso, celular primeiro

O visual do app novo é **o mesmo** do site original. A referência exata é o CSS em `legacy/site.html`
(linhas 6–151) e as capturas em `legacy/screenshots/`. Este guia organiza esse CSS em tokens e componentes para
CSS Modules. Se algo aqui divergir do `legacy/site.html`, vale o legado — e anote em `docs/PROGRESS.md`.

## 1. Conceito

"Guia de bolso": cabeçalho fixo com seções e dias; abaixo, uma linha do tempo de cartões em uma coluna
(largura máxima 680 px). Leitura sob sol e com pressa: fonte hiperlegível, contraste alto, alvos de toque grandes,
compromissos da Convenção em azul, ingressos em dourado, alertas em terracota.

## 2. Tokens (já em `src/styles/tokens.css`)

| Token                    | Claro                 | Escuro                | Uso                                                  |
| ------------------------ | --------------------- | --------------------- | ---------------------------------------------------- |
| `--bg`                   | `#eef0ec`             | `#11151b`             | fundo da página, chips neutros, fundo de campos      |
| `--surface`              | `#ffffff`             | `#1a2029`             | cabeçalho, cartões, folha do popup                   |
| `--ink`                  | `#1c2230`             | `#e9ecf0`             | texto principal                                      |
| `--muted`                | `#5a6271`             | `#a0a8b5`             | texto secundário, horários, eyebrows                 |
| `--line`                 | `#d9ddd5`             | `#2b333e`             | bordas e divisórias                                  |
| `--accent`               | `#2c5a86`             | `#8fb9e6`             | links, Convenção, foco, chip ativo, botões primários |
| `--accent-ink`           | `#ffffff`             | `#0e1620`             | texto sobre `--accent`                               |
| `--accent-soft`          | `#e3ecf6`             | `#1d2d40`             | fundo de compromisso e do cartão "Agora"             |
| `--gold` / `--gold-soft` | `#8a5d0c` / `#f5ead2` | `#e4b862` / `#3a2f18` | ingresso pago, botão de ingresso                     |
| `--ok` / `--ok-soft`     | `#2e7448` / `#e2f1e6` | `#74c793` / `#1b3324` | caixas "Feito", status de sucesso                    |
| `--warn` / `--warn-soft` | `#9c3b1d` / `#fbe9e2` | `#f0997a` / `#3d2219` | alertas e erros                                      |

Escuro vale **só** com `html[data-theme="dark"]` (a chave do cabeçalho aplica e salva). O padrão é o claro; o
sistema não é consultado (decisão D-13 — o legado seguia `prefers-color-scheme`). Nunca use cor fora dos tokens
(as sombras usam `rgba(0,0,0,…)` como no legado).

## 3. Tipografia

| Papel   | Família (variável)                | Pesos    | Tamanhos usados                                                                                                                                                   |
| ------- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Texto   | Atkinson Hyperlegible (`--body`)  | 400, 700 | corpo 16 px / 1,5; secundários .95, .92, .9, .88, .85, .82, .8 rem                                                                                                |
| Títulos | Bricolage Grotesque (`--display`) | 600, 700 | h1 1,3 rem; h2 do dia 1,7 rem (line-height 1,15, `text-wrap: balance`, tracking −.01em); h3 de cartão 1,15 rem; título do popup 1,25 rem; número do chip 1,15 rem |
| Mono    | IBM Plex Mono (`--mono`)          | 500      | horário do item .92 rem (tabular); pronúncia .82 rem; etiqueta "IT · EN" .7 rem                                                                                   |

Fontes já carregadas por `next/font/local` em `src/app/fonts.ts` (self-hosted, subset latin).
Eyebrows: .78 rem, maiúsculas, tracking .08em, `--muted`, 700.

## 4. Componentes (valores do legado)

### 4.1 Página e contêiner

- `.wrap`: `max-width: 680px; margin: 0 auto; padding-inline: max(16px, env(safe-area-inset-*))`.
- `main`: `padding-block: 18px 48px; display: grid; gap: 16px`.
- `body::before`: faixa fixa da altura de `env(safe-area-inset-top)` com `--surface` (notch).
- Rodapé: `--muted`, .82 rem, `padding-bottom: 32px`.

### 4.2 Cabeçalho e tema

- `header`: sticky em `top: env(safe-area-inset-top)`, `z-index: 5`, `--surface`, borda inferior `--line`.
- Marca: flex, espaço entre; h1 sem quebra; data `--muted` .85 rem (some ≤ 430 px).
- Chave de tema: botão sem fundo, altura mínima 40 px, texto 700 .85 rem; trilho 44×26 px, raio 999 px, fundo
  `--line`; bolinha 20 px `--surface` com sombra `0 1px 3px rgba(0,0,0,.3)`, `left: 2px`. Ligado: trilho e borda
  `--accent`, bolinha `left: 20px` com `--accent-ink`. Transição .18 s só sem `prefers-reduced-motion`.

### 4.3 Seções (barra de abas no rodapé — D-14)

- Barra: `position: fixed; inset: auto 0 0`, fundo `--surface`, borda superior `--line`,
  `padding-bottom: env(safe-area-inset-bottom)`; dentro, `.wrap` com os 4 links em flex (gap 4 px).
- Aba: flex 1, coluna (ícone 24 px + nome), altura mínima 56 px, `--muted`, 700, .72 rem, raio 10 px.
- Ativa (`aria-current="page"`): texto e ícone em `--accent`, preenchimento do ícone `--accent-soft`.
- O rodapé de texto ganha `padding-bottom` extra (60 px + área segura) para não ficar sob a barra.
- (O legado tinha um segmented control no cabeçalho: fundo `--bg`, raio 10 px, ativa com fundo `--surface`.)

### 4.4 Chips de dias

- Faixa: flex, gap 6 px, `overflow-x: auto`, sem barra visível, `scroll-snap-type: x proximity`, padding-bottom 10 px.
- Chip: borda `--line`, raio 10 px, padding 6 px 10 px, largura mínima 58 px, centralizado, line-height 1,15,
  fundo `--surface`. Dia da semana .72 rem maiúsculo `--muted` tracking .06em; número em bloco, display 1,15 rem.
- Ativo: fundo e borda `--accent`, textos `--accent-ink`. Hoje (não ativo): borda 2 px `--accent`.

### 4.5 Cabeçalho do dia

- Eyebrow + h2 + parágrafo `--muted` (margin-top 6 px) + `meta` (chips com gap 6 px, margin-top 10 px).
- Chip: .82 rem, padding 3 px 9 px, raio 999 px, fundo `--bg`, borda `--line`. Cidade em 700.

### 4.6 Alerta, nota, "Agora", "Onde dormir"

- Alerta: fundo `--warn-soft`, borda 1 px `--warn`, raio 12 px, padding 12 px 14 px, .95 rem; `strong` em `--warn`.
- Nota: .92 rem `--muted`, borda esquerda 3 px `--line`, padding-left 12 px.
- Agora: fundo `--accent-soft`, borda `--accent`, raio 12 px, padding 12 px 14 px, grid gap 4 px. Rótulo .75 rem
  maiúsculo 700 `--accent`; "Agora:" 700 1,05 rem; subtextos `--muted` .9 rem.
- Onde dormir: flex, borda tracejada `--line`, raio 12 px, padding 12 px 14 px, .95 rem; nome em bloco 700; `when`
  `--muted` .88 rem; "Mapa ↗" à direita.

### 4.7 Cartão de item

- Grid `64px minmax(0,1fr)` (76 px em ≥ 600 px), gap 12 px, fundo `--surface`, borda `--line`, raio 12 px, padding 12 px.
- Horário: mono .92 rem tabular `--muted`, padding-top 2 px, line-height 1,3.
- Lugar: 700, 1,06 rem, line-height 1,3. Ação: .95 rem, margin-top 3 px.
- Linha de ações: flex wrap, gap 8 px, margin-top 9 px.
- Convenção: fundo `--accent-soft`, borda `--accent`, `box-shadow: inset 4px 0 0 var(--accent)`.
- Selo "Convenção": .74 rem 700 maiúsculo tracking .05em, padding 2 px 8 px, raio 6 px, `--accent` / `--accent-ink`.
- Custo: .82 rem, padding 2 px 8 px, raio 6 px, fundo `--bg`, borda `--line`, tabular. Pago: `--gold-soft`, borda
  `--gold`, 700.
- "Mapa ↗": .85 rem 700, sem sublinhado, padding 4 px 10 px, raio 8 px, borda `--accent`, altura mínima 32 px.
- "Idiomas": .85 rem 700, padding 4 px 10 px, raio 8 px, borda `--line`, fundo `--bg`, altura mínima 32 px;
  etiqueta "IT · EN" mono .7 rem `--muted`.
- "Feito": `margin-left: auto`, .85 rem `--muted`, caixa 20×20 com `accent-color: var(--ok)`.
- Feito: opacidade .55 e lugar riscado. Em andamento: `outline: 3px solid var(--accent); outline-offset: 1px`.

### 4.8 Cartões genéricos (Lugares, Infos, Intenções)

- `section`: fundo `--surface`, borda `--line`, raio 12 px, padding 14 px 16 px; h3 display 1,15 rem.
- Listas com gap 6 px; chave/valor em grid `minmax(0,1fr) auto`, gap 6 px 12 px, valor à direita em 700.
- Lugares: linhas com divisória `--line`; botão de ingresso dourado (fundo `--gold-soft`, borda `--gold`, 700,
  .85 rem, raio 8 px, altura mínima 32 px) e nota .8 rem `--muted` abaixo; "Mapa ↗" à direita sem quebra.
- Checklists: caixas 20×20 `accent-color: var(--ok)`, texto alinhado ao topo.
- Botões: altura mínima 44 px, raio 10 px, 700 .92 rem, borda `--accent`; primário com fundo `--accent`; fantasma
  transparente com texto `--accent`.
- Campo/mensagem: fundo `--bg`, borda `--line`, raio 10 px, padding 10 px 12 px; mensagem com altura mínima 96 px.
- Lista de intenções: rolagem própria até 60 vh, itens com borda `--line`, raio 10 px, fundo `--bg`; texto
  `white-space: pre-wrap; overflow-wrap: anywhere`; meta .8 rem `--muted`.
- `<details>` (conteúdo do documento): `summary` como título de cartão (display 1,05–1,15 rem, cursor pointer,
  alvo ≥ 44 px); tabelas com rolagem horizontal própria (nunca a página inteira).

### 4.9 Popup de idiomas

- Fundo `rgba(10,14,20,.55)`; folha `--surface`, largura total até 560 px, até 88 vh com rolagem, raio
  16 px 16 px 0 0, padding com área segura, sombra `0 -6px 30px rgba(0,0,0,.25)`. ≥ 600 px: centralizada, raio 16 px,
  até 80 vh.
- Cabeçalho: título display 1,25 rem + subtítulo `--muted` .9 rem; botão ✕ 44×44, borda `--line`, fundo `--bg`.
- Troca de idioma: como o segmented control; botão ativo com fundo `--accent` e texto `--accent-ink`.
- Frase: borda `--line`, raio 12 px, padding 10 px 12 px, grid `minmax(0,1fr) auto`; texto 700 1,08 rem;
  pronúncia mono .82 rem `--accent`; tradução .9 rem `--muted`; ações empilhadas à direita (botões .8 rem 700,
  borda e texto `--accent`, altura 36 px). "Sempre úteis" com fundo `--bg` nos itens. Link de fallback .85 rem 700
  na largura toda.

## 5. Estados e movimento

- Foco: `:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 6px }`.
- Hover só como reforço (o uso principal é toque).
- Transições curtas (.15–.18 s) apenas com `prefers-reduced-motion: no-preference`.
- Carregando: texto "Carregando…"; sem spinners.

## 6. Capturas de referência (`legacy/screenshots/`, 390×844 @2x)

| Arquivo                                          | O que mostra                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `dia-15-agora-claro.png`                         | Dia 15 às 10h05, cartão "Agora/Próximo", item destacado, página inteira |
| `dia-15-agora-escuro.png`                        | O mesmo no tema escuro                                                  |
| `dia-19-alerta-convencao.png`                    | Alerta, compromissos da Convenção em azul                               |
| `dia-14-antes-da-viagem.png`                     | Contagem regressiva antes da viagem                                     |
| `popup-italiano.png` / `popup-ingles-escuro.png` | Popup de idiomas nos dois idiomas/temas                                 |
| `lugares.png`                                    | Aba Lugares (página inteira) com ingressos                              |
| `infos.png`                                      | Aba Infos (página inteira)                                              |
| `intencoes-site-antigo.png`                      | Aba Intenções no site antigo (no app novo ela usa o login da RF-10)     |

Na Fase 9, tire as mesmas capturas do app novo (Playwright, mesmo tamanho) e compare lado a lado.
