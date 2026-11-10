'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { copy } from '@/lib/copy';

import styles from './shell.module.css';

type Section = {
  href: '/' | '/lugares' | '/intencoes' | '/infos';
  label: string;
  isActive: (pathname: string) => boolean;
  icon: ReactNode;
};

const svg = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
} as const;
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SECTIONS: Section[] = [
  {
    href: '/',
    label: copy.nav.days,
    isActive: (p) => p === '/' || p.startsWith('/dia/'),
    icon: (
      <svg {...svg}>
        <rect x="3" y="5" width="18" height="16" rx="3" {...stroke} />
        <path d="M3 10h18M8 3v4M16 3v4" {...stroke} />
        <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/lugares',
    label: copy.nav.places,
    isActive: (p) => p === '/lugares',
    icon: (
      <svg {...svg}>
        <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" {...stroke} />
        <circle cx="12" cy="10" r="2.4" {...stroke} />
      </svg>
    ),
  },
  {
    href: '/intencoes',
    label: copy.nav.intentions,
    isActive: (p) => p === '/intencoes',
    icon: (
      <svg {...svg}>
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          {...stroke}
        />
      </svg>
    ),
  },
  {
    href: '/infos',
    label: copy.nav.infos,
    isActive: (p) => p === '/infos',
    icon: (
      <svg {...svg}>
        <circle cx="12" cy="12" r="9" {...stroke} />
        <path d="M12 11v5.5" {...stroke} />
        <circle cx="12" cy="7.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
];

/**
 * Barra de abas fixa no rodapé, padrão de app (ícone + nome) — RF-01.3 / D-14.
 * "Dia a dia" fica ativo em "/" e em "/dia/*".
 */
export function SectionsNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.tabs} aria-label={copy.nav.aria}>
      <div className={`wrap ${styles.tabsInner}`}>
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} aria-current={s.isActive(pathname) ? 'page' : undefined}>
            {s.icon}
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
