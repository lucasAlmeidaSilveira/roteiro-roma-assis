# ARCHITECTURE — como o app é montado

Stack: **Next.js 16.4 (App Router, Turbopack, Cache Components, Partial Prefetching, React Compiler, typed
routes) · React 19.3 · TypeScript estrito · Zod 4 · CSS Modules · Vitest + Testing Library · Playwright + axe ·
Vercel.** Versões exatas em `package.json`/`package-lock.json` (instale com `npm ci`).

> Next 16 mudou muitas APIs. Antes de usar qualquer uma, leia o guia correspondente em
> `node_modules/next/dist/docs/` (o `AGENTS.md` manda isso). Exemplos: `02-guides/preventing-flash-before-hydration.md`,
> `03-api-reference/03-file-conventions/route.md`, `02-guides/authentication-with-cache-components.md`.

## 1. Estrutura

```
src/
  app/
    layout.tsx                 ← PRONTO (fontes, tema inline, metadata noindex). Fase 1 acrescenta Header/Footer.
    fonts.ts, icon.png, apple-icon.png, globals.css   ← PRONTOS
    page.tsx                   ← "/" → RedirectToToday (cliente)
    not-found.tsx              ← "Página não encontrada"
    dia/[dia]/page.tsx         ← SSG 14..23 (generateStaticParams) + notFound()
    lugares/page.tsx
    infos/page.tsx
    intencoes/page.tsx         ← casca estática + <IntentionsPanel/> (cliente)
    api/intencoes/route.ts     ← GET (Sheets; sem sessão, D-15)
    manifest.ts, robots.ts
  components/
    shell/      Header.tsx, ThemeSwitch.tsx*, SectionsNav.tsx*, DayChips.tsx*, Footer.tsx, PageHeader.tsx
    day/        DayView.tsx, DayTimeline.tsx*, ItemCard.tsx*, NowCard.tsx*, Countdown.tsx*, StayBlock.tsx, DayDetails.tsx
    phrases/    PhrasesDialog.tsx*, PhraseRow.tsx*
    places/     PlacesDay.tsx, PlacesSummary.tsx
    infos/      Checklist.tsx*, KeyValueCard.tsx, DocSections.tsx
    intentions/ IntentionsPanel.tsx*, LoginForm.tsx*, MessageCard.tsx*
    ui/         Card.tsx, Chip.tsx, InlineText.tsx (renderiza parseInline), ExternalLink.tsx
    pwa/        ServiceWorkerRegister.tsx*
  hooks/        use-now.ts, use-stored.ts           ← PRONTOS e testados
  lib/          schema, content, copy, format, links, places, time, intentions, storage, speech, clipboard, theme
                ← PRONTOS e testados (não reescreva; estenda com testes)
  server/       env.ts, session.ts, sheets.ts, intentions-source.ts   ← Fase 7 (todos com import 'server-only')
  data/         *.json                               ← CONTEÚDO (fonte da verdade)
  styles/       tokens.css                           ← PRONTO
  fonts/        *.woff2 + LICENSES.txt               ← PRONTOS
public/
  sw.js                                              ← PRONTO e validado (Fase 8 só registra)
  icons/*.png                                        ← PRONTOS
tests/
  unit/   (Vitest)  e2e/ (Playwright: rodam no app novo E no site antigo)  fixtures/  stubs/
```

`*` = componente cliente (`'use client'`). Todo o resto é Server Component.

## 2. Fronteira servidor/cliente

- Páginas e blocos estáticos são **Server Components**: leem `src/lib/content.ts` (que tem `import 'server-only'`) e
  passam para os componentes cliente **só o necessário**, serializável. Ex.: `DayView` passa ao `DayTimeline` os
  itens do dia e `phraseSetsForDay(day)` — não o JSON inteiro de frases.
- Componentes cliente nunca importam `src/lib/content.ts`. Textos fixos vêm de `src/lib/copy.ts` (seguro no cliente).
- O que depende de **hora** ou de **localStorage** é calculado só no cliente, via `useSyncExternalStore` com
  snapshot de servidor `null` (hooks prontos: `useNow`, `useNowMinute`, `useDoneMap`, `useLang`,
  `useStoredString`). Isso evita erro de hidratação e o erro de "current time during prerender" do Cache Components.
- Tema: o script inline do `<head>` (`THEME_INIT_SCRIPT`) já aplica o tema salvo antes da pintura. O `ThemeSwitch`
  lê o estado efetivo com `isDarkNow()`, assina `matchMedia('(prefers-color-scheme: dark)')` e o armazenamento, e
  usa `applyTheme()`. Em dev, re-aplique o atributo num `useLayoutEffect` (ver guia de flash do Next, seção
  "Re-applying attributes in development").

## 3. Padrões verificados (protótipo compilado com Next 16.4.6 + `cacheComponents`)

### 3.1 Página do dia (SSG + 404 lógico)

```tsx
// src/app/dia/[dia]/page.tsx
import { notFound } from 'next/navigation';
import { DAY_NUMBERS, getDay } from '@/lib/content';

export function generateStaticParams() {
  return DAY_NUMBERS.map((n) => ({ dia: String(n) }));
}

export default async function DayPage({ params }: PageProps<'/dia/[dia]'>) {
  const { dia } = await params;
  const day = /^\d+$/.test(dia) ? getDay(Number(dia)) : undefined;
  if (!day) notFound();
  return <DayView day={day} />;
}
```

- `dynamicParams`, `dynamic`, `revalidate` **não existem** com Cache Components (o build falha). Dias fora da lista
  renderizam sob demanda e chamam `notFound()`; como o streaming já começou, o status pode ser 200 — o teste checa
  a página "Página não encontrada" e o `noindex` (o Next injeta).
- `generateMetadata` pode dar título por dia: `"{weekday} {day} · {title} — Roma e Assis"`.

### 3.2 Abrir o dia de hoje

```tsx
'use client';
export function RedirectToToday() {
  const router = useRouter();
  const now = useNow();
  useEffect(() => {
    if (now) router.replace(`/dia/${tripState(now).day ?? 14}`);
  }, [now, router]);
  return; /* "Abrindo o dia de hoje…" + links para os 10 dias (sem JS) */
}
```

### 3.3 Linha do tempo (ilha cliente)

`DayView` (servidor) renderiza cabeçalho, alerta, nota, detalhes e "Onde dormir"; `DayTimeline` (cliente) recebe
`items`, `day` e `phraseSets` e renderiza: `Countdown`, `NowCard`, o `<ol>` de `ItemCard` e um único
`PhrasesDialog` controlado (`openKey`, `openPlace`, `triggerRef`). O destaque "em andamento" vem de `nowNext()`.

### 3.4 Popup

Preferir `<dialog>` nativo com `showModal()` (foco preso, Esc e `::backdrop` de graça). Fechar com clique no
backdrop: comparar `event.target === dialogRef.current`. Ao fechar: `stopSpeech()` e devolver o foco ao gatilho.
Travar a rolagem do `body` enquanto aberto. Chamar `initSpeech()` uma vez ao montar.

### 3.5 Route Handlers

```ts
// src/app/api/intencoes/route.ts  (runtime Node, padrão)
export async function GET(request: NextRequest) {
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return json({ error: 'unauthorized' }, 401);
  const result = await loadIntentions(); // fixture | Google
  return result.ok
    ? json({ items: result.items, fetchedAt: new Date().toISOString() })
    : json({ error: result.error }, result.status);
}
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
```

`jose` (JWT) e `google-auth-library` (conta de serviço) compilam e rodam em Route Handlers com Turbopack
(verificado). Use `import 'server-only'` em `src/server/*`.

## 4. Dados

- `src/data/*.json` = conteúdo. Esquemas Zod em `src/lib/schema.ts`; `src/lib/content.ts` valida tudo no import
  (build falha se algo estiver errado).
- IDs estáveis: item `"{dia}-{índice}"`, pendência `"todo-{n}"`, decisão `"decisao-{n}"` (chaves do "Feito").
- Marcação nos textos: só `**negrito**` e `[texto](https://…)` → `parseInline()` → `<InlineText>`. Nada de
  `dangerouslySetInnerHTML` com conteúdo.
- Para mudar conteúdo: edite o JSON, rode `npm run check` (o inventário em `tests/unit/data.test.ts` precisa ser
  atualizado de propósito se algo for removido) e registre em `docs/PROGRESS.md`.

## 5. Intenções: segurança e configuração

```
celular ──GET /api/intencoes──▶ Route Handler ──JWT (conta de serviço)──▶ Google Sheets API
        ◀── JSON {items} (no-store) ─┘             ◀── valores da planilha (só leitura)
```

- Sem sessão nem código de acesso (D-15, pedido do Lucas): a aba é aberta a quem tem o link. O único segredo é a
  chave da conta de serviço, que fica só no servidor.
- `src/server/env.ts`: lê e valida com Zod **sob demanda** (não no import), para o build e as páginas estáticas
  funcionarem sem variáveis. Variáveis: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (trocar `\n` literal
  por quebra de linha), `INTENCOES_SHEET_ID`, `INTENCOES_RANGE` (opcional), `INTENCOES_FIXTURE` (só testes;
  ignorado se `VERCEL === "1"`).
- `src/server/sheets.ts`: `new JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })`
  → `client.request({ url: https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range} })`. Mapear 403/404 →
  `forbidden`.
- Nunca registrar intenções em log; nunca cachear `/api/*` (o `sw.js` já ignora).

## 6. PWA e offline

- `public/sw.js` (pronto, sem dependências, validado num protótipo): na instalação guarda `/`, `/dia/14..23`,
  `/lugares`, `/infos`, `/intencoes`, manifest e ícones, e varre o HTML/CSS para guardar os arquivos
  `/_next/static/*` (JS, CSS, fontes). Navegação: rede primeiro (3,5 s) → cache. `/_next/static`: cache primeiro.
  RSC e outros: stale-while-revalidate. `/api/*`: nunca.
- Fase 8: `ServiceWorkerRegister` (cliente, só `NODE_ENV === 'production'`) no layout; `app/manifest.ts`; cabeçalhos
  do `/sw.js` em `next.config.ts` (`Cache-Control: no-cache, no-store, must-revalidate`, `Service-Worker-Allowed: /`).
- Ao mudar rotas, troque `VERSION` no `sw.js`.
- Por que não Serwist: `createSerwistRoute` (@serwist/turbopack 9.5) exporta `dynamic`/`dynamicParams`/`revalidate`,
  proibidos com Cache Components (ver `docs/DECISIONS.md`).

## 7. Testes

| Camada               | Ferramenta | Onde                             | O que garante                                                                  |
| -------------------- | ---------- | -------------------------------- | ------------------------------------------------------------------------------ |
| Dados                | Vitest     | `tests/unit/data.test.ts`        | esquemas, inventário (nada some), consistência, privacidade                    |
| Lógica               | Vitest     | `tests/unit/*.test.ts(x)`        | horário de Roma, agora/próximo, lugares, intenções, armazenamento, fala, hooks |
| Paridade de conteúdo | Node       | `npm run parity`                 | 1.507 comparações com o site e o documento originais                           |
| Aceitação            | Playwright | `tests/e2e/*.spec.ts`            | comportamento — **os mesmos testes passam no site antigo**                     |
| Acessibilidade       | axe        | `tests/e2e/09-qualidade.spec.ts` | WCAG 2.1 AA sem "serious/critical"                                             |

- `tests/fases.json` lista as fases já implementadas; as outras ficam puladas (CI verde desde o início).
- Testes de componentes novos: colocar ao lado (`*.test.tsx`) ou em `tests/unit`. Ex.: `ItemCard` (custo pago,
  selo, mapa), `PhraseRow` (estados do botão Ouvir com fala simulada), `LoginForm`.
- Relógio nos testes: `page.clock.setFixedTime(new Date('2026-11-15T10:05:00+01:00'))` (horário de Roma).

## 8. Qualidade e entrega

- `npm run check` (lint, typecheck com `next typegen`, unitários, paridade) a cada mudança; `npm run check:all`
  (inclui build e e2e) antes de cada commit de fase. Husky: `pre-commit` formata (lint-staged), `pre-push` roda
  `check`.
- CI: `.github/workflows/ci.yml` (Node 24, `npm ci`, check, Playwright Chromium, e2e, relatório como artefato).
- Deploy: Vercel conectada ao GitHub (push na `main` = produção; PR = preview). Variáveis em `docs/DEPLOY.md`.
