import { expect, test } from '@playwright/test';

import { fase, getDay, routes } from './support';

test.describe('Fase 8 · @novo app instalável e offline', () => {
  fase(8);

  test('manifest com nome, ícones e modo standalone', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBe(true);
    const m = await res.json();
    expect(m.name).toBe('Roma e Assis 2026');
    expect(m.short_name).toBe('Roma e Assis');
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/');
    expect(m.lang).toBe('pt-BR');
    expect(m.icons.some((i: { sizes: string }) => i.sizes === '192x192')).toBe(true);
    expect(m.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true);
  });

  test('depois da primeira visita, todos os dias abrem sem internet', async ({ page, context }) => {
    test.slow();
    await page.goto(routes.day(15));
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.active?.state;
    });
    // dá tempo do service worker guardar as páginas
    await page.waitForTimeout(3000);
    await context.setOffline(true);
    for (const n of [15, 20, 23]) {
      await page.goto(routes.day(n));
      await expect(page.getByRole('heading', { level: 2, name: getDay(n).title })).toBeVisible();
    }
    await page.goto(routes.places);
    await expect(page.getByRole('heading', { level: 2, name: 'Todos os lugares' })).toBeVisible();
    await page.goto(routes.infos);
    await expect(page.getByRole('heading', { level: 2, name: 'Infos práticas' })).toBeVisible();
  });
});
