import { expect, test } from '@playwright/test';

import { fill, plural } from '../../src/lib/format';
import { mapUrl } from '../../src/lib/links';

import {
  LEGACY,
  at,
  days,
  fase,
  getDay,
  go,
  item,
  linksOf,
  plain,
  routes,
  stays,
  ui,
} from './support';

test.describe('Fase 2 · dia a dia (conteúdo completo de cada dia)', () => {
  fase(2);

  for (const day of days) {
    test(`${day.weekday} ${day.day}: cabeçalho, alertas, todos os ${day.items.length} itens e onde dormir`, async ({
      page,
    }) => {
      await at(page, '2026-11-10T12:00:00+01:00');
      await go(page, routes.day(day.day));
      const main = page.locator('main');

      await expect(page.getByRole('heading', { level: 2, name: day.title })).toBeVisible();
      await expect(main).toContainText(
        fill(ui.day.eyebrow, { weekday: day.weekday, day: day.day }),
      );
      await expect(main).toContainText(day.summary);
      await expect(main.getByText(day.city, { exact: true }).first()).toBeVisible();
      const nEv = day.items.filter((i) => i.event).length;
      if (nEv) await expect(main).toContainText(plural(nEv, ui.day.eventsOne, ui.day.eventsOther));
      if (day.alert) {
        await expect(main).toContainText(day.alert.title);
        await expect(main).toContainText(day.alert.body);
      }
      if (day.note) await expect(main).toContainText(day.note);

      await expect(page.locator('[id^="it-"]')).toHaveCount(day.items.length);
      for (const it of day.items) {
        const card = item(page, it.id);
        await expect(card).toContainText(it.label);
        await expect(card).toContainText(it.place);
        await expect(card).toContainText(it.action);
        if (it.cost !== '—')
          await expect(card).toContainText(`${it.paid ? ui.day.paidPrefix : ''}${it.cost}`);
        await expect(card.getByText(ui.day.badge, { exact: true })).toHaveCount(it.event ? 1 : 0);
        const map = card.getByRole('link', { name: ui.day.map });
        if (it.mapQuery) await expect(map).toHaveAttribute('href', mapUrl(it.mapQuery));
        else await expect(map).toHaveCount(0);
        await expect(card.getByRole('button', { name: ui.day.languages })).toHaveCount(1);
        await expect(card.getByRole('checkbox')).toHaveCount(1);
      }

      const stay = stays[day.stay];
      await expect(main).toContainText(ui.day.sleep);
      await expect(main).toContainText(stay.name);
      await expect(main).toContainText(stay.address);
      await expect(main).toContainText(stay.when);
    });
  }

  test('"Feito" fica salvo neste aparelho', async ({ page }) => {
    await go(page, routes.day(14));
    const box = item(page, '14-0').getByRole('checkbox');
    await box.check();
    await page.reload();
    await expect(item(page, '14-0').getByRole('checkbox')).toBeChecked();
    await expect(item(page, '14-1').getByRole('checkbox')).not.toBeChecked();
  });

  test('a página inicial abre o dia de hoje (horário de Roma)', async ({ page }) => {
    await at(page, '2026-11-16T09:00:00+01:00');
    await page.goto(routes.home);
    await expect(page.getByRole('heading', { level: 2, name: getDay(16).title })).toBeVisible();
    if (!LEGACY) await expect(page).toHaveURL(/\/dia\/16$/);
  });

  test('antes da viagem: abre o dia 14 com a contagem regressiva', async ({ page }) => {
    await at(page, '2026-11-10T12:00:00+01:00');
    await page.goto(routes.home);
    await expect(page.getByRole('heading', { level: 2, name: getDay(14).title })).toBeVisible();
    await expect(page.locator('main')).toContainText(
      plural(4, ui.day.countdownOne, ui.day.countdownOther),
    );
  });

  test('contagem no singular na véspera', async ({ page }) => {
    await at(page, '2026-11-13T12:00:00+01:00');
    await go(page, routes.day(15));
    await expect(page.locator('main')).toContainText(
      plural(1, ui.day.countdownOne, ui.day.countdownOther),
    );
  });

  test('chips: dia aberto marcado e dia de hoje identificado', async ({ page }) => {
    await at(page, '2026-11-16T09:00:00+01:00');
    await go(page, routes.day(18));
    const chips = page.getByRole('navigation', { name: ui.nav.daysAria });
    await expect(chips.getByRole('link', { name: 'Qua 18 de novembro' })).toHaveAttribute(
      'aria-current',
      /^(true|page)$/,
    );
    await expect(chips.getByRole('link', { name: 'Seg 16 de novembro (hoje)' })).toBeVisible();
  });

  test('@novo detalhes do documento em cada dia', async ({ page }) => {
    for (const day of days.filter((d) => d.details)) {
      await go(page, routes.day(day.day));
      await page.getByText(ui.day.detailsSummary).click();
      const main = page.locator('main');
      await expect(main).toContainText(plain(day.details!.intro));
      for (const tip of day.details!.tips) {
        await expect(main).toContainText(plain(tip));
        for (const l of linksOf(tip))
          await expect(main.getByRole('link', { name: l.text })).toHaveAttribute('href', l.href);
      }
    }
  });

  test('@novo dia inexistente mostra "Página não encontrada" (fora dos buscadores)', async ({
    page,
  }) => {
    // Com Cache Components o status pode ser 200 (o streaming já começou); o que importa é a página certa.
    await page.goto('/dia/99');
    await expect(page.getByRole('heading', { name: ui.notFound.title })).toBeVisible();
    await expect(page.getByRole('link', { name: ui.notFound.back })).toHaveAttribute('href', '/');
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  });
});
