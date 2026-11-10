import { NextResponse } from 'next/server';

import { loadIntentions } from '@/server/intentions-source';

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });

/**
 * GET /api/intencoes (RF-12): lê a planilha (fixture ou Google) e nunca cacheia.
 * Aberto a quem tem o link (decisão do Lucas, D-15): sem sessão nem código de acesso.
 */
export async function GET() {
  const result = await loadIntentions();
  return result.ok
    ? json({ items: result.items, fetchedAt: new Date().toISOString() })
    : json({ error: result.error }, result.status);
}
