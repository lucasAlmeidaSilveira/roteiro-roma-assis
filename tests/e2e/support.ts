/**
 * Apoio aos testes de aceitação. Os mesmos testes rodam contra:
 *  - o app novo  (npm run test:e2e)          → rotas /dia/14, /lugares…
 *  - o site antigo (npm run test:e2e:legacy) → rotas #dia-14, #lugares…
 * Assim, "passar nos testes" = "fazer tudo o que o site antigo fazia".
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import daysJson from '../../src/data/days.json';
import docJson from '../../src/data/doc.json';
import eventJson from '../../src/data/event.json';
import infosJson from '../../src/data/infos.json';
import intentionsJson from '../../src/data/intentions.json';
import phrasesJson from '../../src/data/phrases.json';
import staysJson from '../../src/data/stays.json';
import ticketsJson from '../../src/data/tickets.json';
import todoJson from '../../src/data/todo.json';
import uiJson from '../../src/data/ui.json';
import type { Day, PhraseSet, Stay, StayKey, Ticket } from '../../src/lib/schema';

import fases from '../fases.json';

export const LEGACY = process.env.LEGACY === '1';

export const days = daysJson as Day[];
export const phrases = phrasesJson as Record<string, PhraseSet>;
export const stays = staysJson as Record<StayKey, Stay>;
export const tickets = ticketsJson as Ticket[];
export const todos = todoJson;
export const infos = infosJson;
export const intentions = intentionsJson;
export const doc = docJson;
export const eventProgram = eventJson;
export const ui = uiJson;

export const getDay = (n: number) => days.find((d) => d.day === n)!;

/** Pula o grupo se a fase ainda não foi habilitada em tests/fases.json (no site antigo, roda tudo). */
export function fase(n: number) {
  const enabled = (fases.habilitadas as number[]).includes(n);
  test.skip(!LEGACY && !enabled, `Fase ${n} ainda não habilitada em tests/fases.json`);
}

export const routes = {
  home: '/',
  day: (n: number) => (LEGACY ? `/#dia-${n}` : `/dia/${n}`),
  places: LEGACY ? '/#lugares' : '/lugares',
  infos: LEGACY ? '/#infos' : '/infos',
  intentions: LEGACY ? '/#intencoes' : '/intencoes',
};

/** Fixa o relógio do navegador (use ISO com fuso, ex.: 2026-11-15T10:05:00+01:00 = horário de Roma). */
export async function at(page: Page, iso: string) {
  await page.clock.setFixedTime(new Date(iso));
}

export async function go(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('main')).toBeVisible();
}

/** Cartão de um item do roteiro: <li id="it-14-0">. */
export const item = (page: Page, id: string) => page.locator(`[id="it-${id}"]`);

/** Item em andamento: aria-current="time" no app novo (classe is-now no antigo). */
export async function expectNow(loc: Locator) {
  if (LEGACY) await expect(loc).toHaveClass(/is-now/);
  else await expect(loc).toHaveAttribute('aria-current', 'time');
}

/** Texto visível de uma string com **negrito** e [link](url). */
export const plain = (s: string) =>
  s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1');

/** Links de uma string com [texto](url). */
export const linksOf = (s: string) =>
  [...s.matchAll(/\[([^\]]+)\]\((https?:[^)]+)\)/g)].map((m) => ({ text: m[1]!, href: m[2]! }));

/** Primeiro item do roteiro que usa um conjunto de frases. */
export function itemUsing(key: string) {
  for (const d of days) {
    const it = d.items.find((i) => i.phrases === key);
    if (it) return { day: d, item: it };
  }
  throw new Error('nenhum item usa ' + key);
}

/** Simula a Web Speech API: "start" faz a fala começar e terminar; "silent" nunca começa. */
export async function fakeSpeech(page: Page, mode: 'start' | 'silent') {
  await page.addInitScript((m) => {
    const synth = {
      speaking: false,
      pending: false,
      speak(u: SpeechSynthesisUtterance) {
        (window as unknown as { __spoken: string[] }).__spoken.push(`${u.lang}|${u.text}`);
        if (m === 'start') {
          setTimeout(() => u.onstart?.(new Event('start') as SpeechSynthesisEvent), 20);
          setTimeout(() => u.onend?.(new Event('end') as SpeechSynthesisEvent), 1200);
        }
      },
      cancel() {},
      resume() {},
      pause() {},
      getVoices: () => [],
      addEventListener() {},
      removeEventListener() {},
      onvoiceschanged: null,
    };
    (window as unknown as { __spoken: string[] }).__spoken = [];
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  }, mode);
}
