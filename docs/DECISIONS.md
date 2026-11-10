# Decisões de arquitetura (ADRs curtos)

Formato: decisão · por quê · alternativas descartadas. Acrescente novas decisões no fim (nunca apague).

## D-01 · Next.js 16.4 com os padrões do create-next-app

Cache Components, Partial Prefetching, React Compiler e typed routes ligados (é o que o `create-next-app@16.4.6`
gera hoje). O app é quase todo estático, então o modelo novo encaixa bem: páginas prerenderizadas, dados por
pedido só na API de intenções. **Consequências:** `dynamic`/`dynamicParams`/`revalidate` não existem; dia inválido
mostra "não encontrado" com status que pode ser 200 (streaming); hora e localStorage só no cliente.

## D-02 · Conteúdo em JSON + Zod (não em componentes, não em CMS)

O conteúdo é finito e muda pouco; JSON versionado no git dá histórico, revisão e testes. Zod valida no build.
`npm run parity` prova a migração (1.507 comparações). **Descartado:** CMS (custo e login), MDX (mistura conteúdo e
layout).

## D-03 · CSS Modules + tokens CSS (sem Tailwind)

Fidelidade total ao CSS do site original (copiar regras é direto), zero dependência extra. **Descartado:**
Tailwind (reescreveria todo o visual em classes utilitárias; mais chance de divergir).

## D-04 · Fontes self-hosted (next/font/local)

Mesmas famílias do original (Atkinson Hyperlegible, Bricolage Grotesque, IBM Plex Mono), licença OFL, subset latin.
Build não depende do Google Fonts (que falha atrás de proxies/CI restritos) e o app funciona offline.

## D-05 · Tema com script inline (padrão oficial do Next), sem next-themes

Seguimos `preventing-flash-before-hydration.md` dos docs do Next 16: script no `<head>` + `suppressHydrationWarning`.
Mantém a chave `roteiro-roma-tema` do original. **Descartado:** next-themes (dependência a mais para 20 linhas).

## D-06 · Hora e localStorage via useSyncExternalStore

Snapshot de servidor `null` → nada dependente do cliente entra no HTML estático; sem erro de hidratação.
Lógica pura (`src/lib/time.ts`) testada com datas fixas no fuso de Roma.

## D-07 · Intenções: Google Forms + planilha lida no servidor por conta de serviço

Decisão do Lucas: "um único forms meu, e o sistema pega as intenções que as pessoas forem preenchendo lá". O site
original lia pela conexão do Google Sheets do Claude (só funcionava dentro do app do Claude). Na Vercel: Route
Handler + `google-auth-library` com escopo somente leitura e a planilha compartilhada com o robô. **Descartado:**
publicar a planilha como CSV (intenções ficariam públicas); banco próprio (o formulário já resolve a coleta).

## D-08 · Acesso do dono por código + cookie JWT (jose)

Um único usuário; código em `OWNER_PASSCODE`, comparação em tempo constante, cookie `HttpOnly` assinado por 30
dias. Verificação perto dos dados (na API), não em proxy/middleware. **Descartado:** Auth.js + Google OAuth (mais
passos de configuração para um usuário só).

## D-09 · Offline com service worker próprio (public/sw.js), sem Serwist

`@serwist/turbopack` 9.5 usa um Route Handler que exporta `dynamic`/`dynamicParams`/`revalidate` — proibidos com
Cache Components. O SW próprio (~120 linhas) foi validado num protótipo Next 16.4.6: depois da primeira visita,
todas as páginas abrem offline. **Rever** se o Serwist lançar suporte a Cache Components.

## D-10 · Testes de aceitação que rodam no site antigo e no novo

`tests/e2e` usa nomes acessíveis e ids de contrato, não classes. Rodando contra `legacy/site.html`
(`npm run test:e2e:legacy`, 66 testes verdes) provamos que os testes descrevem o comportamento original; o app
novo precisa passar nos mesmos. Testes só do app novo levam `@novo` no título.

## D-11 · ESLint 9 (por enquanto)

O `create-next-app@16.4.6` instala ESLint 9 com `eslint-config-next`; o npm avisa que o 9 está sem suporte.
Migrar para o 10 quando os plugins do `eslint-config-next` declararem suporte.

## D-12 · Node 24 LTS

`.nvmrc` e `engines` em 24.x (Vercel usa a mesma versão). TypeScript 5.x como no scaffold oficial (o 7 já saiu,
mas o Next 16.4 ainda gera projetos com o 5).
