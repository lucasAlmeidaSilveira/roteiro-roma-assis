import { expect, test } from '@playwright/test';

import { at, days, fase, getDay, go, routes, ui } from './support';

test.describe('Fase 1 · casca do app (cabeçalho, navegação, tema, rodapé)', () => {
  fase(1);

  test('cabeçalho com marca, seções, os 10 dias e o rodapé', async ({ page }) => {
    await at(page, '2026-11-10T12:00:00+01:00');
    await go(page, routes.day(14));
    await expect(page.getByRole('heading', { level: 1, name: ui.brand })).toBeVisible();

    const views = page.getByRole('navigation', { name: ui.nav.aria });
    await expect(views.getByRole('link')).toHaveText([
      ui.nav.days,
      ui.nav.places,
      ui.nav.intentions,
      ui.nav.infos,
    ]);
    await expect(views.getByRole('link', { name: ui.nav.days })).toHaveAttribute(
      'aria-current',
      'page',
    );

    const chips = page.getByRole('navigation', { name: ui.nav.daysAria }).getByRole('link');
    await expect(chips).toHaveCount(10);
    for (const [i, d] of days.entries()) {
      await expect(chips.nth(i)).toHaveAccessibleName(`${d.weekday} ${d.day} de novembro`);
      await expect(chips.nth(i)).toContainText(String(d.day));
    }
    await expect(page.getByText(ui.footer)).toBeVisible();
  });

  test('o tema escuro liga, mostra o rótulo certo e continua depois de recarregar', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await go(page, routes.day(14));
    const sw = page.getByRole('switch', { name: ui.theme.aria });
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await expect(sw).toContainText(ui.theme.light);
    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await expect(sw).toContainText(ui.theme.dark);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('switch', { name: ui.theme.aria })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('sem escolha salva, segue o tema do sistema', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await go(page, routes.day(14));
    await expect(page.getByRole('switch', { name: ui.theme.aria })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('as seções levam às páginas certas; "Dia a dia" abre o dia de hoje', async ({ page }) => {
    await at(page, '2026-11-17T09:00:00+01:00');
    await go(page, routes.day(14));
    const views = page.getByRole('navigation', { name: ui.nav.aria });
    await views.getByRole('link', { name: ui.nav.places }).click();
    await expect(page.getByRole('heading', { level: 2, name: ui.places.title })).toBeVisible();
    await views.getByRole('link', { name: ui.nav.infos }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Infos práticas' })).toBeVisible();
    await views.getByRole('link', { name: ui.nav.intentions }).click();
    await expect(page.getByRole('heading', { level: 2, name: ui.intentions.title })).toBeVisible();
    await views.getByRole('link', { name: ui.nav.days }).click();
    await expect(page.getByRole('heading', { level: 2, name: getDay(17).title })).toBeVisible();
  });
});
