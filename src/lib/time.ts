/**
 * Relógio da viagem. Tudo em horário de Roma (Europe/Rome), independente do fuso do aparelho.
 * Funções puras: recebem `now` para serem testáveis (o hook useNowMinute fornece o valor).
 */
export const TRIP = { year: 2026, month: 11, firstDay: 14, lastDay: 23 } as const;

export type RomeParts = {
  y: number;
  m: number;
  d: number;
  /** minutos desde 00:00 em Roma */
  minutes: number;
  hh: string;
  mm: string;
};

const romeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function romeParts(now: Date): RomeParts {
  const p = Object.fromEntries(romeFormatter.formatToParts(now).map((x) => [x.type, x.value]));
  const hh = p.hour ?? '00';
  const mm = p.minute ?? '00';
  return {
    y: Number(p.year),
    m: Number(p.month),
    d: Number(p.day),
    minutes: Number(hh) * 60 + Number(mm),
    hh,
    mm,
  };
}

export type TripState = {
  /** Dia do roteiro (14–23) ou null fora da viagem. A madrugada/dia 24 conta como dia 23. */
  day: number | null;
  /** Minutos "do dia do roteiro" (no dia 24 soma 1440, como no site antigo). */
  minutes: number;
  rome: RomeParts;
};

export function tripState(now: Date): TripState {
  const rome = romeParts(now);
  if (rome.y === TRIP.year && rome.m === TRIP.month && rome.d >= 14 && rome.d <= 24) {
    if (rome.d === 24) return { day: 23, minutes: rome.minutes + 1440, rome };
    return { day: rome.d, minutes: rome.minutes, rome };
  }
  return { day: null, minutes: rome.minutes, rome };
}

/** Dias (calendário de Roma) até 14/11/2026. Negativo depois do início. */
export function daysUntilTrip(now: Date): number {
  const r = romeParts(now);
  return Math.round((Date.UTC(2026, 10, 14) - Date.UTC(r.y, r.m - 1, r.d)) / 86_400_000);
}

export function toMinutes(start: string | null, nextDay?: boolean): number | null {
  if (!start) return null;
  return Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5)) + (nextDay ? 1440 : 0);
}

/** 1615 → "02h55" (o dia seguinte volta a contar do zero). */
export function formatClock(totalMinutes: number): string {
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
}

/** 85 → "1h 25 min"; 40 → "40 min". */
export function formatDuration(diffMinutes: number): string {
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  return `${h ? `${h}h ` : ''}${m} min`;
}

export type NowNext = {
  /** índice do item em andamento (o último que já começou) ou -1 */
  current: number;
  /** índice do próximo item com horário ou -1 */
  next: number;
  /** minutos até o próximo, ou null */
  untilNext: number | null;
  /** minuto (do dia do roteiro) em que o próximo começa, ou null */
  nextAt: number | null;
};

/** "Agora/Próximo" igual ao site antigo: ignora itens sem horário; lista em ordem cronológica. */
export function nowNext(
  items: { start: string | null; nextDay?: boolean }[],
  minutes: number,
): NowNext {
  let current = -1;
  for (let i = 0; i < items.length; i++) {
    const it = items[i]!;
    const m = toMinutes(it.start, it.nextDay);
    if (m === null) continue;
    if (m <= minutes) current = i;
    else return { current, next: i, untilNext: m - minutes, nextAt: m };
  }
  return { current, next: -1, untilNext: null, nextAt: null };
}
