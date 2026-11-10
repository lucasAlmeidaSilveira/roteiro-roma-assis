import { expect, test } from '@playwright/test';

import { mapUrl } from '../../src/lib/links';

import {
  doc,
  eventProgram,
  fase,
  go,
  infos,
  linksOf,
  plain,
  routes,
  stays,
  todos,
  ui,
} from './support';

test.describe('Fase 6 · Infos práticas', () => {
  fase(6);

  test('pendências "Antes de viajar" com marcação salva', async ({ page }) => {
    await go(page, routes.infos);
    await expect(page.getByRole('heading', { level: 2, name: infos.title })).toBeVisible();
    await expect(page.locator('main')).toContainText(infos.todoTitle);
    for (const t of todos) await expect(page.getByRole('checkbox', { name: t.text })).toBeVisible();
    await page.getByRole('checkbox', { name: todos[1]!.text }).check();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: todos[1]!.text })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: todos[0]!.text })).not.toBeChecked();
  });

  test('hospedagens, transporte, orçamento e lembretes', async ({ page }) => {
    await go(page, routes.infos);
    const main = page.locator('main');
    for (const s of infos.stays.items) {
      await expect(main).toContainText(s.title);
      await expect(main).toContainText(s.text);
    }
    for (const key of ['olympic', 'locanda'] as const) {
      await expect(main.locator(`a[href="${mapUrl(stays[key].mapQuery!)}"]`).first()).toBeVisible();
    }
    for (const card of [infos.transport, infos.budget]) {
      await expect(main).toContainText(card.title);
      for (const r of card.rows) {
        await expect(main).toContainText(r.label);
        await expect(main).toContainText(r.value);
      }
    }
    await expect(main).toContainText(infos.transport.note);
    await expect(main).toContainText(infos.reminders.title);
    for (const r of infos.reminders.items) await expect(main).toContainText(plain(r));
  });

  test('@novo conteúdo do documento: alertas, como se locomover, hotéis, decisões, orçamento, Convenção e fontes', async ({
    page,
  }) => {
    await go(page, routes.infos);
    const main = page.locator('main');
    // seções recolhíveis (<details>): abre todas
    for (const s of await main.locator('details > summary').all()) await s.click();

    await expect(main).toContainText(ui.infos.overviewTitle);
    await expect(main).toContainText(doc.overview.lead);
    for (const b of doc.overview.bullets) await expect(main).toContainText(`${b.title} ${b.text}`);
    await expect(main).toContainText(doc.overview.premise);

    await expect(main).toContainText(ui.infos.transportRoutesTitle);
    for (const r of doc.transport.routes) {
      await expect(main).toContainText(r.route);
      await expect(main).toContainText(r.how);
    }
    await expect(main).toContainText(doc.transport.prices);

    await expect(main).toContainText(doc.hotels.title);
    for (const h of doc.hotels.options) {
      await expect(main).toContainText(h.name);
      await expect(main).toContainText(h.price);
    }
    await expect(main).toContainText(doc.hotels.suggestion);

    await expect(main).toContainText(ui.infos.decisionsTitle);
    for (const d of doc.decisions.items) {
      const box = page.getByRole('checkbox', { name: d.text });
      await expect(box).toBeVisible();
      if (d.done) await expect(box).toBeChecked();
    }

    await expect(main).toContainText(ui.infos.budgetDetailsTitle);
    for (const r of doc.budgetDetails.rows) await expect(main).toContainText(r.category);

    await expect(main).toContainText(ui.infos.eventTitle);
    for (const d of eventProgram.days) {
      await expect(main).toContainText(d.heading);
      for (const s of d.schedule) await expect(main).toContainText(s);
    }

    await expect(main).toContainText(ui.infos.sourcesTitle);
    for (const s of doc.sources.items) {
      for (const l of linksOf(s))
        await expect(main.locator(`a[href="${l.href}"]`).first()).toBeAttached();
    }
  });
});
