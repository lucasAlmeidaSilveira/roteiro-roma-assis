# Relatório da varredura (10/11/2026)

Varredura completa do sistema antes da migração: site (artifact, versão 23), documento "Roteiro Roma e Assis — 14
a 24 de novembro de 2026" (revisão 135), PDFs da Convenção e da hospedagem, formulário e planilha de intenções.

## Inventário migrado para `src/data`

| Origem    | Conteúdo                                                                                                                                | Quantidade                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Site      | dias / itens do roteiro                                                                                                                 | 10 / 87 (13, 12, 8, 7, 7, 7, 8, 6, 6, 13)                       |
| Site      | compromissos da Convenção / ingressos pagos                                                                                             | 15 / 5                                                          |
| Site      | conjuntos de frases / frases                                                                                                            | 28 / 115 italiano + 115 inglês (todas com pronúncia e tradução) |
| Site      | ingressos oficiais / hospedagens / pendências                                                                                           | 6 / 4 / 9                                                       |
| Site      | Infos (hospedagens, transporte, orçamento, lembretes), textos fixos, mensagem e "onde levar" das intenções                              | todos                                                           |
| Documento | visão geral, resumo por dia, como se locomover, hotéis 22→23, orçamento detalhado, 10 decisões, 26 fontes, introdução e dicas de 9 dias | todos                                                           |
| PDF       | programação oficial da Convenção (7 dias) e convidados                                                                                  | todos                                                           |

`npm run parity` confere 1.507 pontos entre os JSON e os originais; `npm run test:e2e:legacy` roda os 66 testes de
comportamento no site original (todos verdes).

## Inconsistências encontradas e corrigidas

| #   | Onde                                     | Problema                                                                                                                        | Correção                                      |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| F1  | Site, Infos → "Antes de viajar"          | Pendência dizia "chegada às 10h30" na Locanda, mas o trem comprado (RV 4712) chega às 9h06 e o roteiro marca a Locanda às ~9h15 | "chegada por volta das 9h15" (site v24 e kit) |
| F2  | Site, dom 22 → Santa Cecília             | O horário do afresco de Cavallini (domingo, 11h30–12h30) estava só no documento                                                 | acrescentado no site v24 e no kit             |
| F3  | Documento, "Resumo dos lugares" → Dom 15 | Citava Via della Conciliazione e Castel Sant'Angelo, que saíram do roteiro                                                      | removidos (doc rev 136 e kit)                 |
| A1  | Site, chips dos dias                     | Nome visível "Sáb14" não estava contido no nome acessível (WCAG 2.5.3)                                                          | espaço entre dia da semana e número (v24)     |
| A2  | Site, Intenções                          | Campo da mensagem sem rótulo acessível                                                                                          | `aria-label="Mensagem para enviar"` (v24)     |

Conferido sem divergência: horários e lugares de todos os 87 itens entre site e documento; custos; ingressos;
hospedagens e taxas (€135 Olympic, €18 Locanda) com os vouchers; programação da Convenção com o PDF oficial.

## Intenções

A planilha ligada ao formulário (`13s8YEO8…`, aba "Respostas ao formulário 1") já recebe respostas — o
formulário está gravando no lugar certo. No site atual elas aparecem para o dono dentro do app do Claude; no app
novo, pela conta de serviço (docs/DEPLOY.md §3).

## O que fica fora do repositório (privacidade)

Nomes completos dos hóspedes, código do bilhete de trem, comprador, localizadores e telefones dos vouchers,
e-mails e o conteúdo das intenções. Os testes usam dados fictícios (`tests/fixtures/intencoes.json`).

## Pendências da viagem (do roteiro, ainda abertas)

- Comprar online o Terravision de 14/11 e confirmar o primeiro horário (~5h35).
- Comprar 2 ingressos do Coliseu, Fórum e Palatino para seg 23/11, 13h (nomes de você e da sua irmã).
- Reservar o hotel de 22→23/11 em Tiburtina com cancelamento grátis.
- Avisar a Locanda Giustini com 24h de antecedência (chegada ~9h15 de 20/11 e malas).
- Confirmar o local do encerramento de 21/11, o terminal do voo (T1/T3) e o check-in sozinho no Olympic.
- Na véspera (19/11): reconferir o trem RV 4712 e a lista de trens garantidos da greve.
