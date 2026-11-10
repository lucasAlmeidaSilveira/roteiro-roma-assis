---
paths:
  - 'src/app/**/*.tsx'
  - 'src/components/**'
  - 'src/**/*.module.css'
---

# Regras para páginas e componentes

- Server Component por padrão. `'use client'` só para estado/efeito/evento, o mais na folha possível; passe por
  props só o necessário (serializável). Componente cliente nunca importa `@/lib/content`.
- Textos: `@/lib/copy` (fixos) ou props vindas de `@/lib/content`. Nada de texto do roteiro no JSX.
- Hora → `useNow` + `tripState`/`nowNext`; localStorage → `useDoneMap`/`useLang`/`useStoredString`. Nunca no
  render do servidor.
- Estilo: CSS Modules + `var(--token)`; valores de `docs/DESIGN.md`; sem cores literais; `prefers-reduced-motion`.
- Acessibilidade: nomes e roles da SPEC §6; foco visível; diálogos com foco preso e devolvido; `lang` nas frases.
- Links externos com `target="_blank" rel="noopener noreferrer"` (componente `ExternalLink`).
- Texto com marcação → `<InlineText>` (`parseInline`); nunca `dangerouslySetInnerHTML` (a única exceção é o script
  de tema do layout).
