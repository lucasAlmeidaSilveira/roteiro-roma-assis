import { expect, test } from '@playwright/test';

import { mapUrl } from '../../src/lib/links';
import { placesForDay } from '../../src/lib/places';

import { LEGACY, days, doc, fase, go, plain, routes, tickets, ui } from './support';

test.describe('Fase 5 · Lugares (todos os lugares por dia, com mapa e ingresso oficial)', () => {
  fase(5);

  test('introdução e um bloco por dia com todos os lugares, mapas e ingressos', async ({
    page,
  }) => {
    await go(page, routes.places);
    await expect(page.getByRole('heading', { level: 2, name: ui.places.title })).toBeVisible();
    await expect(page.locator('main')).toContainText(ui.places.intro);

    for (const day of days) {
      const name = `${day.weekday} ${day.day} · ${day.title}`;
      const section = page.locator('section').filter({ has: page.getByRole('heading', { name }) });
      await expect(section).toHaveCount(1);
      await expect(section.getByRole('link', { name })).toHaveAttribute(
        'href',
        LEGACY ? `#dia-${day.day}` : `/dia/${day.day}`,
      );
      const rows = placesForDay(day, tickets);
      await expect(section.getByRole('listitem')).toHaveCount(rows.length);
      for (const [i, r] of rows.entries()) {
        const li = section.getByRole('listitem').nth(i);
        await expect(li).toContainText(r.place);
        await expect(li.getByRole('link', { name: ui.day.map })).toHaveAttribute(
          'href',
          mapUrl(r.mapQuery),
        );
        if (r.paidCost) await expect(li).toContainText(r.paidCost);
        if (r.ticket) {
          await expect(li.getByRole('link', { name: `${r.ticket.label} ↗` })).toHaveAttribute(
            'href',
            r.ticket.url,
          );
          await expect(li).toContainText(r.ticket.note);
        }
      }
    }
  });

  test('@novo resumo por dia (tabela do documento)', async ({ page }) => {
    await go(page, routes.places);
    await page.getByText(ui.places.summaryTitle).click();
    const main = page.locator('main');
    await expect(main).toContainText(plain(doc.placesSummary.intro));
    for (const r of doc.placesSummary.rows) {
      await expect(main).toContainText(r.day);
      await expect(main).toContainText(r.places);
      await expect(main).toContainText(r.paid);
    }
  });
});
