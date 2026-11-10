/**
 * Integridade do conteúdo. Os números de inventário protegem contra perda acidental de conteúdo:
 * se você REMOVER algo de propósito, atualize o número aqui e registre em docs/PROGRESS.md.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  days,
  doc,
  eventProgram,
  infos,
  intentionsConfig,
  phrases,
  stays,
  tickets,
  todos,
} from '@/lib/content';
import { toMinutes } from '@/lib/time';

const allItems = days.flatMap((d) => d.items);

describe('inventário (nada pode sumir)', () => {
  it('tem exatamente o conteúdo do site antigo + documento', () => {
    expect(days.map((d) => d.day)).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
    expect(days.map((d) => d.items.length)).toEqual([13, 12, 8, 7, 7, 7, 8, 6, 6, 13]);
    expect(allItems).toHaveLength(87);
    expect(Object.keys(phrases)).toHaveLength(28);
    expect(Object.values(phrases).reduce((n, s) => n + s.it.length, 0)).toBe(115);
    expect(Object.values(phrases).reduce((n, s) => n + s.en.length, 0)).toBe(115);
    expect(tickets).toHaveLength(6);
    expect(todos).toHaveLength(9);
    expect(Object.keys(stays)).toEqual(['olympic', 'locanda', 'extra', 'aero']);
    expect(infos.transport.rows).toHaveLength(6);
    expect(infos.budget.rows).toHaveLength(7);
    expect(infos.reminders.items).toHaveLength(4);
    expect(intentionsConfig.where).toHaveLength(6);
    expect(doc.decisions.items).toHaveLength(10);
    expect(doc.sources.items).toHaveLength(26);
    expect(doc.hotels.options).toHaveLength(5);
    expect(doc.transport.routes).toHaveLength(8);
    expect(doc.placesSummary.rows).toHaveLength(10);
    expect(doc.budgetDetails.rows).toHaveLength(6);
    expect(eventProgram.days).toHaveLength(7);
  });

  it('mantém os compromissos da Convenção e os ingressos pagos', () => {
    expect(days.map((d) => d.items.filter((i) => i.event).length)).toEqual([
      0, 1, 2, 2, 2, 3, 2, 3, 0, 0,
    ]);
    expect(allItems.filter((i) => i.paid).map((i) => i.id)).toEqual([
      '14-11',
      '15-7',
      '15-9',
      '20-1',
      '23-4',
    ]);
    expect(days.filter((d) => d.alert).map((d) => d.day)).toEqual([19, 20, 21]);
    expect(days.filter((d) => d.note).map((d) => d.day)).toEqual([14, 16, 18]);
  });
});

describe('consistência', () => {
  it('datas e dias da semana batem com novembro de 2026', () => {
    const wd = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (const d of days) {
      expect(d.date).toBe(`2026-11-${d.day}`);
      expect(d.weekday).toBe(wd[new Date(Date.UTC(2026, 10, d.day)).getUTCDay()]);
    }
  });

  it('ids dos itens são "dia-índice" em sequência', () => {
    for (const d of days) d.items.forEach((it, i) => expect(it.id).toBe(`${d.day}-${i}`));
  });

  it('itens com horário estão em ordem cronológica (Agora/Próximo depende disso)', () => {
    for (const d of days) {
      const mins = d.items
        .map((i) => toMinutes(i.start, i.nextDay))
        .filter((m): m is number => m !== null);
      expect(mins).toEqual([...mins].sort((a, b) => a - b));
    }
  });

  it('todo item aponta para um conjunto de frases com italiano e inglês', () => {
    for (const it of allItems) {
      const set = phrases[it.phrases];
      expect(set, it.id).toBeDefined();
      expect(set!.it.length).toBe(set!.en.length);
    }
  });

  it('toda hospedagem citada existe', () => {
    for (const d of days) expect(stays[d.stay]).toBeDefined();
    for (const s of infos.stays.items) if (s.stay) expect(stays[s.stay]).toBeDefined();
  });

  it('todo ingresso corresponde a um lugar que aparece na aba Lugares', () => {
    for (const t of tickets) {
      const it = allItems.find((i) => i.place === t.place);
      expect(it, t.place).toBeDefined();
      expect(it!.mapQuery).toBeTruthy();
      expect(it!.place.includes('→')).toBe(false);
    }
  });

  it('correções da varredura estão aplicadas', () => {
    expect(todos.find((t) => t.id === 'todo-4')!.text).toContain('por volta das 9h15');
    expect(days.find((d) => d.day === 22)!.items[3]!.action).toContain('(domingo, 11h30–12h30)');
    expect(doc.placesSummary.rows[1]!.places).not.toContain('Conciliazione');
  });
});

describe('privacidade', () => {
  it('nenhum dado público contém e-mail, código de bilhete ou dados de voucher', () => {
    const dir = path.join(process.cwd(), 'src/data');
    for (const f of readdirSync(dir)) {
      const txt = readFileSync(path.join(dir, f), 'utf8');
      expect(txt, f).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
      expect(txt, f).not.toMatch(/\b\d{9,}\b/);
      expect(txt, f).not.toMatch(/Localizador|Voucher:\s*\d/i);
    }
  });
});
