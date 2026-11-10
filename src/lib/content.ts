/**
 * Acesso tipado e validado ao conteúdo. Só roda no servidor (build/SSG):
 * componentes cliente recebem apenas os dados de que precisam, via props.
 */
import 'server-only';

import daysJson from '@/data/days.json';
import docJson from '@/data/doc.json';
import eventJson from '@/data/event.json';
import infosJson from '@/data/infos.json';
import intentionsJson from '@/data/intentions.json';
import phrasesJson from '@/data/phrases.json';
import staysJson from '@/data/stays.json';
import ticketsJson from '@/data/tickets.json';
import todoJson from '@/data/todo.json';

import {
  daysSchema,
  docSchema,
  eventSchema,
  infosSchema,
  intentionsConfigSchema,
  phrasesSchema,
  staysSchema,
  ticketsSchema,
  todoSchema,
  type Day,
  type PhraseSet,
} from './schema';

export const days = daysSchema.parse(daysJson);
export const stays = staysSchema.parse(staysJson);
export const phrases = phrasesSchema.parse(phrasesJson);
export const tickets = ticketsSchema.parse(ticketsJson);
export const todos = todoSchema.parse(todoJson);
export const infos = infosSchema.parse(infosJson);
export const intentionsConfig = intentionsConfigSchema.parse(intentionsJson);
export const doc = docSchema.parse(docJson);
export const eventProgram = eventSchema.parse(eventJson);

export const DAY_NUMBERS = days.map((d) => d.day);

export function getDay(n: number): Day | undefined {
  return days.find((d) => d.day === n);
}

/** Conjuntos de frases usados num dia + "basic" (para mandar ao cliente só o necessário). */
export function phraseSetsForDay(day: Day): Record<string, PhraseSet> {
  const keys = new Set(['basic', ...day.items.map((i) => i.phrases)]);
  return Object.fromEntries([...keys].map((k) => [k, phrases[k]!]));
}

export function intentionMessage(): string {
  return intentionsConfig.messageTemplate.replace('{formUrl}', intentionsConfig.formUrl);
}
