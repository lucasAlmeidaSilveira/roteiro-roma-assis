import { parseInline } from '@/lib/format';

import { ExternalLink } from './ExternalLink';

/** Renderiza texto com **negrito** e [link](https://…) sem HTML cru (RF-13.4). */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((t, i) => {
        if (t.type === 'strong') return <strong key={i}>{t.value}</strong>;
        if (t.type === 'link')
          return (
            <ExternalLink key={i} href={t.href}>
              {t.value}
            </ExternalLink>
          );
        return t.value;
      })}
    </>
  );
}
