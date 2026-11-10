# Publicar: GitHub + Vercel + Google (passo a passo)

Tempo total: ~40 minutos. Você precisa de: conta no GitHub, conta na Vercel (entra com o GitHub, plano Hobby
gratuito para uso pessoal), a conta Google dona do formulário de intenções, e o computador com Node 24 e o
projeto funcionando (`npm run check` verde).

> Nunca cole segredos (a chave do Google) no chat do Claude nem no código. Eles vão só na Vercel
> (e, se quiser rodar as intenções no seu computador, no arquivo `.env.local`, que o git ignora).

## 1. GitHub (repositório privado)

**Pelo terminal (com o GitHub CLI `gh` instalado e logado — `gh auth login`):**

```bash
git init -b main          # se ainda não for repositório
git add -A && git commit -m "chore: kit inicial"
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
3. Framework: **Next.js** (detectado). Não mude Build/Output. **Deploy**.
4. Em ~2 minutos você recebe um endereço `https://roteiro-roma-assis-<algo>.vercel.app`. O roteiro já funciona;
   a aba Intenções vai dizer que a leitura ainda não foi configurada — é o passo 3.

A partir daqui: todo `git push` na `main` publica sozinho; um Pull Request ganha um endereço de prévia.

## 3. Google: conta de serviço que só LÊ a planilha de intenções

A conta de serviço é um "robô" do Google com acesso de leitura só à planilha que você compartilhar com ele.

1. Acesse console.cloud.google.com com a **mesma conta Google do formulário**.
2. No topo, **Selecionar projeto → Novo projeto** → nome `roteiro-roma-assis` → **Criar** (não precisa de
   faturamento).
3. Menu **APIs e serviços → Biblioteca** → procure **Google Sheets API** → **Ativar**.
4. Menu **IAM e administrador → Contas de serviço → Criar conta de serviço** → nome `leitor-intencoes` →
   **Criar e continuar** → pule as permissões (nenhum papel é necessário) → **Concluir**.
5. Clique na conta criada → aba **Chaves → Adicionar chave → Criar nova chave → JSON → Criar**. Um arquivo `.json`
   é baixado. Guarde-o fora do projeto (ele é uma senha).
   - Se aparecer "a criação de chaves está desativada por uma política da organização", você está numa conta
     de empresa/escola: use uma conta Gmail pessoal para o projeto do Google Cloud.
6. Abra o arquivo JSON e copie o valor de `client_email` (algo como
   `leitor-intencoes@roteiro-roma-assis.iam.gserviceaccount.com`).
7. Abra a **planilha de respostas do formulário**
   (`https://docs.google.com/spreadsheets/d/13s8YEO8NqSDPatk8zntatW9cW3YEZZZFeJmG5pqFaCY/edit`) →
   **Compartilhar** → cole o `client_email` → papel **Leitor** → desmarque "Notificar" → **Compartilhar**.

## 4. Variáveis de ambiente na Vercel

Vercel → seu projeto → **Settings → Environment Variables**. Cadastre (ambiente **Production**; marque também
**Preview** se quiser testar em prévias):

| Nome                           | Valor                                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | o `client_email` do JSON                                                                                                            |
| `GOOGLE_PRIVATE_KEY`           | o `private_key` do JSON, inteiro, do `-----BEGIN PRIVATE KEY-----` ao `-----END PRIVATE KEY-----\n`, com os `\n` do jeito que estão |
| `INTENCOES_SHEET_ID`           | `13s8YEO8NqSDPatk8zntatW9cW3YEZZZFeJmG5pqFaCY`                                                                                      |

Não cadastre `INTENCOES_FIXTURE` na Vercel (é só para testes; o app ignora na Vercel de qualquer forma).

Depois: **Deployments** → no último deploy, **⋯ → Redeploy** (variáveis novas só valem após um novo deploy).

## 5. Testar no iPhone

1. Abra o endereço da Vercel no Arc/Safari.
2. **Compartilhar → Adicionar à Tela de Início** (abre em tela cheia, como app).
3. Confira: dia de hoje abre sozinho; tema claro/escuro; "Feito"; popup **Idiomas** (Italiano/English) — para
   ouvir, **desligue o modo silencioso** (botão de Ação do iPhone 15) e aumente o volume.
4. **Intenções:** as respostas do formulário aparecem, mais novas no topo (a aba é aberta a quem tem o link, D-15).
   Toque em "Atualizar" depois de enviar uma resposta de teste pelo formulário.
5. **Offline:** com internet, abra o app uma vez e espere alguns segundos; ligue o **modo avião**; abra os dias,
   Lugares e Infos — tudo deve abrir. (As intenções precisam de internet.)

## 6. Rodar as intenções no seu computador (opcional)

Copie `.env.example` para `.env.local`, preencha os mesmos valores e rode `npm run dev`. Sem isso, a aba mostra
"não configurado" — o resto funciona normalmente.

## 7. Problemas comuns

| Sintoma                                                       | Causa provável                                                  | O que fazer                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Intenções: "A leitura da planilha ainda não foi configurada…" | variável faltando ou sem redeploy                               | conferir o passo 4 e fazer Redeploy                                       |
| Intenções: "O servidor não tem acesso à planilha…"            | planilha não compartilhada com a conta de serviço ou ID errado  | refazer o passo 3.7; conferir `INTENCOES_SHEET_ID`                        |
| Intenções: "código: upstream"                                 | chave colada errada (quebras de linha) ou Sheets API desativada | colar o `private_key` inteiro de novo; conferir o passo 3.3               |
| Deploy falhou na Vercel                                       | erro de build                                                   | abrir o log do deploy; rodar `npm run check:all` no computador e corrigir |
| Áudio mudo no iPhone                                          | modo silencioso                                                 | desligar o silencioso; senão, usar o link "Ouvir no Google Tradutor"      |

## 8. Domínio próprio (opcional)

Vercel → **Settings → Domains → Add** e siga as instruções de DNS do seu provedor.
