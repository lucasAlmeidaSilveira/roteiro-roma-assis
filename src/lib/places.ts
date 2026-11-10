import type { Day, Ticket } from './schema';

export type PlaceRow = {
  place: string;
  mapQuery: string;
  /** custo do ingresso quando o item é pago (chip dourado) */
  paidCost?: string;
  ticket?: Ticket;
};

/**
 * Lugares de um dia, como na aba "Lugares" do site antigo:
 * só itens com mapa, sem deslocamentos (nome com "→"), sem repetir o mesmo lugar no dia.
 */
export function placesForDay(day: Day, tickets: Ticket[]): PlaceRow[] {
  const seen = new Set<string>();
  const rows: PlaceRow[] = [];
  for (const it of day.items) {
    if (!it.mapQuery || it.place.includes('→') || seen.has(it.place)) continue;
    seen.add(it.place);
    const ticket = tickets.find((t) => t.place === it.place);
    rows.push({
      place: it.place,
      mapQuery: it.mapQuery,
      ...(it.paid ? { paidCost: it.cost } : {}),
      ...(ticket ? { ticket } : {}),
    });
  }
  return rows;
}
