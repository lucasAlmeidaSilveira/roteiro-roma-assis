# Publicar: GitHub + Vercel (passo a passo)

Tempo total: ~15 minutos. Você precisa de: conta no GitHub, conta na Vercel (entra com o GitHub, plano Hobby
gratuito para uso pessoal) e o computador com Node 24 e o projeto funcionando (`npm run check` verde).

> Não há segredos nem variáveis de ambiente para cadastrar (D-15 e D-16 em `docs/DECISIONS.md`): a aba
> Intenções é aberta a quem tem o link e lê a planilha de respostas pelo export em CSV.

## 1. GitHub (repositório privado)

**Pelo terminal (com o GitHub CLI `gh` instalado e logado — `gh auth login`):**

```bash
gh repo create roteiro-roma-assis --private --source=. --push
```

**Ou pelo site:** github.com → **New repository** → nome `roteiro-roma-assis` → **Private** → sem README →
**Create**. Depois, no terminal:

```bash
git remote add origin https://github.com/<seu-usuario>/roteiro-roma-assis.git
git push -u origin main
```

A aba **Actions** do repositório roda o CI a cada push (lint, tipos, testes, build, e2e). Nada a configurar.

## 2. Vercel (primeiro deploy)

1. vercel.com → **Sign up / Log in with GitHub**.
2. **Add New… → Project** → em "Import Git Repository", autorize o acesso ao repositório `roteiro-roma-assis` →
   **Import**.
3. Framework: **Next.js** (detectado). Não mude Build/Output nem cadastre variáveis. **Deploy**.
4. Em ~2 minutos você recebe um endereço `https://roteiro-roma-assis-<algo>.vercel.app`. Tudo já funciona,
   inclusive a aba Intenções.

A partir daqui: todo `git push` na `main` publica sozinho; um Pull Request ganha um endereço de prévia.

## 3. Planilha de intenções (uma conferência só)

O app lê a planilha de respostas do formulário pelo link que está em `src/data/intentions.json` (`sheetUrl`),
usando o export em CSV do Google. Para isso ela precisa estar compartilhada como **"Qualquer pessoa com o
link" → Leitor** (em 10/11/2026 já estava assim; o export respondeu com os dados).

Se um dia a aba mostrar "O app não conseguiu abrir a planilha…": abra a planilha → **Compartilhar** → **Acesso
geral** → **Qualquer pessoa com o link** → **Leitor** → Concluído → toque em **Atualizar** no app.

Se as respostas do formulário forem para **outra aba** (não a primeira) da planilha, cadastre na Vercel a
variável opcional `INTENCOES_GID` com o número que aparece depois de `gid=` no link daquela aba, e faça Redeploy.

## 4. Testar no iPhone

1. Abra o endereço da Vercel no Arc/Safari.
2. **Compartilhar → Adicionar à Tela de Início** (abre em tela cheia, como app).
3. Confira: dia de hoje abre sozinho; tema claro/escuro; "Feito"; popup **Idiomas** (Italiano/English) — para
   ouvir, **desligue o modo silencioso** (botão de Ação do iPhone 15) e aumente o volume.
4. **Intenções:** as respostas do formulário aparecem, mais novas no topo. Toque em "Atualizar" depois de enviar
   uma resposta de teste pelo formulário.
5. **Offline:** com internet, abra o app uma vez e espere alguns segundos; ligue o **modo avião**; abra os dias,
   Lugares e Infos — tudo deve abrir. (As intenções precisam de internet.)

## 5. Rodar no seu computador

`npm run dev` e abra http://localhost:3000. A aba Intenções lê a planilha real, sem configurar nada. Nos testes
automatizados o Playwright define `INTENCOES_FIXTURE=1` sozinho, para usar dados fictícios (nunca cadastre isso
na Vercel).

## 6. Problemas comuns

| Sintoma                                                | Causa provável                                       | O que fazer                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Intenções: "O app não conseguiu abrir a planilha…"     | planilha deixou de ser "qualquer pessoa com o link"  | passo 3                                                                       |
| Intenções: "código: upstream"                          | Google fora do ar ou sem internet no servidor        | tentar de novo em alguns minutos                                              |
| Intenções: "O link da planilha de respostas não está…" | `sheetUrl` em `src/data/intentions.json` inválido    | colar o link da planilha (com `/spreadsheets/d/…`) e publicar                 |
| A planilha foi lida, mas está vazia                    | o formulário grava em outra planilha ou em outra aba | no Forms: Respostas → Ver no Planilhas; conferir `sheetUrl` / `INTENCOES_GID` |
| Deploy falhou na Vercel                                | erro de build                                        | abrir o log do deploy; rodar `npm run check:all` no computador e corrigir     |
| Áudio mudo no iPhone                                   | modo silencioso                                      | desligar o silencioso; senão, usar o link "Ouvir no Google Tradutor"          |

## 7. Domínio próprio (opcional)

Vercel → **Settings → Domains → Add** e siga as instruções de DNS do seu provedor.

## 8. Atualizar o roteiro pelo celular (D-17)

Não existe tela de edição no site: quem edita é o Claude Code na nuvem, a seu pedido, e a Vercel publica.

1. Uma vez só: em claude.ai/code, conecte o GitHub e instale o app do Claude no repositório
   `roteiro-roma-assis` (privado). O ambiente padrão já permite `npm install` e acesso ao GitHub.
2. No iPhone: app do Claude → aba **Código** → repositório `roteiro-roma-assis`, branch `main` → escreva o
   pedido (ex.: "/roteiro adianta o Coliseu de seg 23/11 para as 11h"). Pode escrever sem o `/roteiro`; o
   Claude reconhece um pedido de mudança no roteiro.
3. O Claude edita `src/data`, roda `npm run check`, registra em `docs/PROGRESS.md`, commita e envia direto para
   a `main`. Aprove o que ele pedir (editar `src/data` e `git push` pedem confirmação, por
   `.claude/settings.json`).
4. Em 1–2 min a Vercel publica. Feche e abra o app de novo (ou puxe a página) para ver a versão nova. Se o
   Claude renumerou itens de um dia, os "Feitos" daquele dia podem ter trocado de lugar.

Seu notebook não precisa estar ligado. Se o `npm run check` ficar vermelho, o Claude não publica e explica.
