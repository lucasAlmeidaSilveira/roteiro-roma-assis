import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** Link externo: nova aba com noopener/noreferrer (regra do projeto). */
export function ExternalLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel'
>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
