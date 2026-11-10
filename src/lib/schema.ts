/**
 * Contratos de dados (Zod). Os JSON em src/data são a fonte da verdade do conteúdo
 * e são validados por estes esquemas no build e nos testes (tests/unit/data.test.ts).
 * Nunca afrouxe um esquema para "fazer passar": corrija o dado.
 */
import { z } from 'zod';

const text = z.string().trim().min(1);
const https = z.url({ protocol: /^https$/ });

export const stayKeySchema = z.enum(['olympic', 'locanda', 'extra', 'aero']);
export type StayKey = z.infer<typeof stayKeySchema>;

export const itemSchema = z.strictObject({
  /** `${dia}-${índice}` — igual ao site antigo; também é a chave do "Feito" no localStorage. */
  id: z.string().regex(/^(1[4-9]|2[0-3])-\d{1,2}$/),
  /** Início "HH:MM" em horário de Roma; null quando o horário é "a confirmar" etc. */
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  /** true quando o horário é da madrugada do dia seguinte (ex.: check-in do voo no dia 24). */
  nextDay: z.literal(true).optional(),
  label: text,
  place: text,
  action: text,
  /** "—" quando não há custo. */
  cost: text,
  /** Busca do Google Maps; sem ela, o item não tem link de mapa nem entra em Lugares. */
  mapQuery: text.optional(),
  /** Compromisso oficial da Convenção (cartão azul + selo "Convenção"). */
  event: z.literal(true).optional(),
  /** Ingresso pago (chip dourado). */
  paid: z.literal(true).optional(),
  /** Chave do conjunto de frases (src/data/phrases.json). */
  phrases: text,
});
export type Item = z.infer<typeof itemSchema>;

export const daySchema = z.strictObject({
  day: z.number().int().min(14).max(23),
  date: z.iso.date(),
  weekday: z.enum(['Sáb', 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex']),
  title: text,
  city: z.enum(['Roma', 'Assis']),
  stay: stayKeySchema,
  summary: text,
  alert: z.strictObject({ title: text, body: text }).optional(),
  note: text.optional(),
  /** Texto extra que só existia no documento (intro + dicas). Aceita **negrito** e [link](https://…). */
  details: z.strictObject({ heading: text, intro: text, tips: z.array(text) }).optional(),
  items: z.array(itemSchema).min(1),
});
export type Day = z.infer<typeof daySchema>;
export const daysSchema = z.array(daySchema).length(10);

export const staySchema = z.strictObject({
  name: text,
  address: text,
  mapQuery: text.nullable(),
  when: text,
});
export type Stay = z.infer<typeof staySchema>;
export const staysSchema = z.record(stayKeySchema, staySchema);

export const phraseSchema = z.strictObject({ text, pron: text, pt: text });
export type Phrase = z.infer<typeof phraseSchema>;
export const phraseSetSchema = z.strictObject({
  title: text,
  it: z.array(phraseSchema).min(1),
  en: z.array(phraseSchema).min(1),
});
export type PhraseSet = z.infer<typeof phraseSetSchema>;
export const phrasesSchema = z
  .record(z.string(), phraseSetSchema)
  .refine((p) => 'basic' in p, 'phrases.json precisa do conjunto "basic"');
export type Lang = 'it' | 'en';

export const ticketSchema = z.strictObject({ place: text, url: https, label: text, note: text });
export type Ticket = z.infer<typeof ticketSchema>;
export const ticketsSchema = z.array(ticketSchema);

export const todoSchema = z.array(z.strictObject({ id: z.string().regex(/^todo-\d+$/), text }));
export type Todo = z.infer<typeof todoSchema>[number];

const kvRow = z.strictObject({ label: text, value: text });
export const infosSchema = z.strictObject({
  eyebrow: text,
  title: text,
  todoTitle: text,
  stays: z.strictObject({
    title: text,
    items: z.array(z.strictObject({ title: text, text, stay: stayKeySchema.optional() })),
  }),
  transport: z.strictObject({ title: text, rows: z.array(kvRow), note: text }),
  budget: z.strictObject({ title: text, rows: z.array(kvRow) }),
  reminders: z.strictObject({ title: text, items: z.array(text) }),
});
export type Infos = z.infer<typeof infosSchema>;

export const intentionsConfigSchema = z.strictObject({
  formUrl: https,
  messageTemplate: text.refine(
    (t) => t.includes('{formUrl}'),
    'messageTemplate precisa de {formUrl}',
  ),
  where: z.array(text).min(1),
});

export const docSchema = z.strictObject({
  title: text,
  overview: z.strictObject({
    lead: text,
    bullets: z.array(z.strictObject({ title: text, text })),
    premise: text,
  }),
  placesSummary: z.strictObject({
    intro: text,
    rows: z.array(z.strictObject({ day: text, places: text, paid: text })),
    legend: text,
  }),
  transport: z.strictObject({
    intro: text,
    routes: z.array(z.strictObject({ route: text, how: text, time: text })),
    prices: text,
  }),
  hotels: z.strictObject({
    title: text,
    intro: text,
    note: text,
    options: z.array(z.strictObject({ name: text, rating: text, price: text, why: text })),
    extra: text,
    suggestion: text,
  }),
  budgetDetails: z.strictObject({
    intro: text,
    rows: z.array(z.strictObject({ category: text, range: text })),
    note: text,
  }),
  decisions: z.strictObject({
    intro: text,
    items: z.array(
      z.strictObject({ id: z.string().regex(/^decisao-\d+$/), done: z.boolean(), text }),
    ),
  }),
  sources: z.strictObject({ note: text, items: z.array(text) }),
});
export type DocContent = z.infer<typeof docSchema>;

export const eventSchema = z.strictObject({
  title: text,
  days: z.array(
    z.strictObject({
      date: z.iso.date(),
      heading: text,
      place: text.optional(),
      theme: text.optional(),
      schedule: z.array(text).min(1),
    }),
  ),
  guests: z.array(text),
});
export type EventProgram = z.infer<typeof eventSchema>;
