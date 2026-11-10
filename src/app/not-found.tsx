import Link from 'next/link';

import { PageHeader } from '@/components/shell/PageHeader';
import { copy } from '@/lib/copy';

/** Dia inexistente ou endereço errado (RF-01.8). O Next já injeta noindex aqui. */
export default function NotFound() {
  return (
    <main className="wrap">
      <PageHeader eyebrow={copy.brand} title={copy.notFound.title}>
        <p>{copy.notFound.text}</p>
      </PageHeader>
      <p>
        <Link href="/">{copy.notFound.back}</Link>
      </p>
    </main>
  );
}
