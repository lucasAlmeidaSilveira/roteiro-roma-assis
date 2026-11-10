import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { fase, go, item, routes, ui } from './support';

const PAGES = [routes.day(14), routes.day(19), routes.places, routes.infos, routes.intentions];

test.describe('Fase 9 · qualidade (acessibilidade, erros, segurança)', () => {
  fase(9);

  for (const path of PAGES) {
    test(`acessibilidade sem problemas graves em ${path}`, async ({ page }) => {
      await go(page, path);
      const r = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }

  test('acessibilidade do popup de idiomas, nos dois temas', async ({ page }) => {
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await go(page, routes.day(14));
      await item(page, '14-11').getByRole('button', { name: ui.day.languages }).click();
      const r = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${scheme} ${v.id}`)).toEqual([]);
      await page.keyboard.press('Escape');
    }
  });

  test('@novo nenhuma página gera erro no console (inclui erros de hidratação)', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.clock.setFixedTime(new Date('2026-11-15T10:05:00+01:00'));
    for (const path of ['/', ...PAGES]) await go(page, path);
    expect(errors).toEqual([]);
  });

  test('@novo cabeçalhos de segurança e fora dos buscadores', async ({ request }) => {
    const res = await request.get('/dia/14');
    const h = res.headers();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['x-robots-tag']).toContain('noindex');
    expect(h['x-powered-by']).toBeUndefined();
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toMatch(/Disallow: \//);
  });
});
