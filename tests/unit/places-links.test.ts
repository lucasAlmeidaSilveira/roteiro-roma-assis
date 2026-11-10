import { describe, expect, it } from 'vitest';

import { days, tickets } from '@/lib/content';
import { mapUrl, speechText, translateUrl } from '@/lib/links';
import { placesForDay } from '@/lib/places';

const day = (n: number) => days.find((d) => d.day === n)!;

describe('Lugares', () => {
  it('sábado 14: sem deslocamentos, sem repetir o aeroporto, com ingresso do Vaticano', () => {
    const rows = placesForDay(day(14), tickets);
    expect(rows.map((r) => r.place)).toEqual([
      'Aeroporto de Fiumicino',
      'Grand Hotel Olympic',
      'H&M, Via del Corso 422',
      'Piazza di Spagna',
      'Museus do Vaticano e Capela Sistina',
    ]);
    const vat = rows.at(-1)!;
    expect(vat.paidCost).toBe('€25');
    expect(vat.ticket?.url).toBe('https://tickets.museivaticani.va');
  });

  it('todos os 6 ingressos aparecem em algum dia', () => {
    const withTicket = days.flatMap((d) => placesForDay(d, tickets)).filter((r) => r.ticket);
    expect(withTicket.map((r) => r.place).sort()).toEqual(tickets.map((t) => t.place).sort());
  });

  it('total de linhas por dia igual ao site antigo', () => {
    expect(days.map((d) => placesForDay(d, tickets).length)).toEqual([
      5, 7, 4, 2, 3, 3, 3, 1, 5, 7,
    ]);
  });
});

describe('links', () => {
  it('Google Maps e Tradutor', () => {
    expect(mapUrl('Coliseu, Roma')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Coliseu%2C%20Roma',
    );
    expect(speechText('Vorrei… ')).toBe('Vorrei');
    expect(translateUrl('Vorrei…', 'it')).toBe(
      'https://translate.google.com/?sl=it&tl=pt&op=translate&text=Vorrei',
    );
    expect(translateUrl('Hi', 'en')).toContain('sl=en&tl=pt');
  });
});
