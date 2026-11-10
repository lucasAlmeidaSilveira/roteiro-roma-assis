import type { Metadata } from 'next';

import { PlacesDay } from '@/components/places/PlacesDay';
import { PlacesSummary } from '@/components/places/PlacesSummary';
import { PageHeader } from '@/components/shell/PageHeader';
import { days, doc, tickets } from '@/lib/content';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: `${copy.places.title} — ${copy.brand}` };

/** Todos os lugares por dia (RF-08). */
export default function PlacesPage() {
  return (
    <main className="wrap">
      <PageHeader eyebrow={copy.places.eyebrow} title={copy.places.title}>
        <p>{copy.places.intro}</p>
      </PageHeader>
      {days.map((d) => (
        <PlacesDay key={d.day} day={d} tickets={tickets} />
      ))}
      <PlacesSummary summary={doc.placesSummary} />
    </main>
  );
}
