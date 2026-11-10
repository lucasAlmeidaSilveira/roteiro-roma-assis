import { expect, test } from '@playwright/test';

import { at, expectNow, fase, getDay, go, item, routes } from './support';

test.describe('Fase 3 · "Agora / Próximo" no horário de Roma', () => {
  fase(3);

  test('domingo 15 às 10h05: agora, próximo e item destacado', async ({ page }) => {
    await at(page, '2026-11-15T10:05:00+01:00');
    await go(page, routes.day(15));
    const card = page.getByRole('status').filter({ hasText: 'Hoje ·' });
    await expect(card).toContainText('Hoje · 10h05 em Roma');
    await expect(card).toContainText('Agora: Santuário da Divina Misericórdia');
    await expect(card).toContainText(getDay(15).items[4]!.action);
    await expect(card).toContainText(
      'Próximo: Pizzarium, Via della Meloria 43 às 11h30 (em 1h 25 min)',
    );
    await expectNow(item(page, '15-4'));
  });

  test('madrugada do dia 24: a página inicial mostra o dia 23 e o check-in do voo', async ({
    page,
  }) => {
    await at(page, '2026-11-24T01:00:00+01:00');
    await page.goto(routes.home);
    await expect(page.getByRole('heading', { level: 2, name: getDay(23).title })).toBeVisible();
    const card = page.getByRole('status').filter({ hasText: 'Hoje ·' });
    await expect(card).toContainText('Hoje · 01h00 em Roma');
    await expect(card).toContainText('Próximo: Aeroporto de Fiumicino às 02h55 (em 1h 55 min)');
  });

  test('depois do último item: "Nada mais programado hoje."', async ({ page }) => {
    await at(page, '2026-11-16T23:30:00+01:00');
    await go(page, routes.day(16));
    await expect(page.getByRole('status').filter({ hasText: 'Hoje ·' })).toContainText(
      'Nada mais programado hoje.',
    );
  });

  test('o cartão só aparece no dia de hoje', async ({ page }) => {
    await at(page, '2026-11-15T10:05:00+01:00');
    await go(page, routes.day(17));
    await expect(page.getByText('Hoje · 10h05 em Roma')).toHaveCount(0);
  });

  test('o horário avança sozinho a cada minuto', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-15T10:05:10+01:00') });
    await go(page, routes.day(15));
    await expect(page.getByText('Hoje · 10h05 em Roma')).toBeVisible();
    await page.clock.runFor(61_000);
    await expect(page.getByText('Hoje · 10h06 em Roma')).toBeVisible();
  });
});
