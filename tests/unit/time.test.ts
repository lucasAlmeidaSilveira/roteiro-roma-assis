import { describe, expect, it } from 'vitest';

import { days } from '@/lib/content';
import {
  daysUntilTrip,
  formatClock,
  formatDuration,
  nowNext,
  romeParts,
  toMinutes,
  tripState,
} from '@/lib/time';

const rome = (iso: string) => new Date(iso); // ISO com offset explícito
const day = (n: number) => days.find((d) => d.day === n)!;

describe('relógio de Roma', () => {
  it('converte para o horário de Roma (novembro = UTC+1)', () => {
    const p = romeParts(new Date('2026-11-15T09:05:00Z'));
    expect(p).toMatchObject({ y: 2026, m: 11, d: 15, hh: '10', mm: '05', minutes: 605 });
  });

  it('fora da viagem não há dia', () => {
    expect(tripState(rome('2026-11-10T12:00:00+01:00')).day).toBeNull();
    expect(tripState(rome('2026-11-25T08:00:00+01:00')).day).toBeNull();
    expect(tripState(rome('2026-10-20T08:00:00+02:00')).day).toBeNull();
  });

  it('dias da viagem e a madrugada do dia 24 contando como dia 23', () => {
    expect(tripState(rome('2026-11-14T00:30:00+01:00'))).toMatchObject({ day: 14, minutes: 30 });
    expect(tripState(rome('2026-11-23T23:59:00+01:00'))).toMatchObject({ day: 23, minutes: 1439 });
    expect(tripState(rome('2026-11-24T01:00:00+01:00'))).toMatchObject({ day: 23, minutes: 1500 });
  });

  it('conta os dias até a viagem pelo calendário de Roma', () => {
    expect(daysUntilTrip(rome('2026-11-10T12:00:00+01:00'))).toBe(4);
    expect(daysUntilTrip(rome('2026-11-13T23:30:00+01:00'))).toBe(1);
    // 23h30 de 13/11 em São Paulo já é 14/11 em Roma
    expect(daysUntilTrip(rome('2026-11-13T23:30:00-03:00'))).toBe(0);
  });
});

describe('formatos', () => {
  it('minutos e relógio', () => {
    expect(toMinutes('06:52')).toBe(412);
    expect(toMinutes('02:55', true)).toBe(1615);
    expect(toMinutes(null)).toBeNull();
    expect(formatClock(1615)).toBe('02h55');
    expect(formatClock(605)).toBe('10h05');
    expect(formatDuration(85)).toBe('1h 25 min');
    expect(formatDuration(40)).toBe('40 min');
    expect(formatDuration(120)).toBe('2h 0 min');
  });
});

describe('Agora / Próximo', () => {
  it('domingo 15 às 10h05: agora Divina Misericórdia, próximo Pizzarium em 1h 25 min', () => {
    const r = nowNext(day(15).items, 605);
    expect(day(15).items[r.current]!.place).toBe('Santuário da Divina Misericórdia');
    expect(day(15).items[r.next]!.place).toBe('Pizzarium, Via della Meloria 43');
    expect(r.untilNext).toBe(85);
    expect(r.nextAt).toBe(690);
  });

  it('antes do primeiro e depois do último item', () => {
    expect(nowNext(day(16).items, 0)).toMatchObject({ current: -1, next: 0 });
    expect(nowNext(day(16).items, 23 * 60)).toMatchObject({
      current: 7,
      next: -1,
      untilNext: null,
    });
  });

  it('ignora itens sem horário (quinta 19)', () => {
    const r = nowNext(day(19).items, 12 * 60);
    expect(r.current).toBe(2);
    expect(r.next).toBe(5);
  });

  it('madrugada do dia 24: check-in do voo como próximo', () => {
    const r = nowNext(day(23).items, 1500);
    expect(day(23).items[r.current]!.label).toBe('~22h10');
    expect(day(23).items[r.next]!.label).toBe('Ter ~02h55');
    expect(r.untilNext).toBe(115);
  });
});
