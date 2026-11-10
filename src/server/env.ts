import 'server-only';

import { z } from 'zod';

/** Variáveis validadas SOB DEMANDA (nunca no import): o build e as páginas estáticas não precisam delas. */
const googleSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_PRIVATE_KEY: z
    .string()
    .min(1)
    .transform((k) => k.replace(/\\n/g, '\n')),
  INTENCOES_SHEET_ID: z.string().min(1),
  INTENCOES_RANGE: z
    .string()
    .trim()
    .optional()
    .transform((r) => (r ? r : 'A1:Z2000')),
});

export type GoogleEnv = z.infer<typeof googleSchema>;

export function getGoogleEnv(): GoogleEnv | null {
  const r = googleSchema.safeParse(process.env);
  return r.success ? r.data : null;
}

/** Modo de teste: lê tests/fixtures/intencoes.json. Nunca vale na Vercel. */
export function isFixtureMode(): boolean {
  return process.env.INTENCOES_FIXTURE === '1' && process.env.VERCEL !== '1';
}
