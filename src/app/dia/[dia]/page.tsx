import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DayView } from '@/components/day/DayView';
import { DAY_NUMBERS, getDay } from '@/lib/content';
import { copy } from '@/lib/copy';

export function generateStaticParams() {
  return DAY_NUMBERS.map((n) => ({ dia: String(n) }));
}

function resolveDay(dia: string) {
  return /^\d+$/.test(dia) ? getDay(Number(dia)) : undefined;
}

export async function generateMetadata({ params }: PageProps<'/dia/[dia]'>): Promise<Metadata> {
  const { dia } = await params;
  const day = resolveDay(dia);
  if (!day) return { title: copy.notFound.title };
  return { title: `${day.weekday} ${day.day} · ${day.title} — ${copy.brand}` };
}

export default async function DayPage({ params }: PageProps<'/dia/[dia]'>) {
  const { dia } = await params;
  const day = resolveDay(dia);
  if (!day) notFound();
  return <DayView day={day} />;
}
