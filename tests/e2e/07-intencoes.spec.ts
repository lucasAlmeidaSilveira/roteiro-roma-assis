import { expect, test } from '@playwright/test';

import { fill, plural } from '../../src/lib/format';

import { fase, go, intentions, routes, ui } from './support';

const message = intentions.messageTemplate.replace('{formUrl}', intentions.formUrl);

// Decisão do Lucas (10/11/2026, D-15): a aba é aberta a quem tem o link — sem código de acesso.
// O servidor lê tests/fixtures/intencoes.json (INTENCOES_FIXTURE=1 no playwright.config.ts).
test.describe('Fase 7 · @novo Intenções (lidas da planilha pelo servidor)', () => {
  fase(7);

  test('a API responde sem sessão e nunca cacheia', async ({ request }) => {
    const res = await request.get('/api/intencoes');
    expect(res.status()).toBe(200);
    expect(res.headers()['cache-control']).toContain('no-store');
    const json = await res.json();
    expect(json.items).toHaveLength(3);
  });

  test('mostra as intenções (mais novas primeiro), a mensagem e "Onde levar"', async ({ page }) => {
    await go(page, routes.intentions);
    const main = page.locator('main');
    await expect(main).toContainText(ui.intentions.lead);
    await expect(main).toContainText(plural(3, ui.intentions.countOne, ui.intentions.countOther));
    const items = main.getByRole('listitem').filter({ hasText: /Pela|Em ação/ });
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Em ação de graças');
    await expect(items.nth(0)).toContainText('João');
    await expect(items.nth(1)).toContainText('Pela saúde da família');
    await expect(items.nth(2)).toContainText('Maria');
    await expect(main).toContainText(/Atualizado às \d{2}:\d{2}\. As mais novas no topo\./);
    await expect(main).not.toContainText('Linha vazia');

    await expect(main).toContainText(ui.intentions.messageTitle);
    await expect(page.getByRole('textbox')).toHaveValue(message);
    await expect(main).toContainText(ui.intentions.whereTitle);
    for (const w of intentions.where) await expect(main).toContainText(w);
  });

  test('copiar a mensagem e atualizar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await go(page, routes.intentions);
    await page.getByRole('button', { name: ui.intentions.copyMessage }).click();
    await expect(page.getByText(ui.intentions.copied)).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(message);

    const api = page.waitForResponse(
      (r) => r.url().endsWith('/api/intencoes') && r.status() === 200,
    );
    await page.getByRole('button', { name: ui.intentions.refresh }).click();
    await api;
    await expect(page.locator('main')).toContainText(
      plural(3, ui.intentions.countOne, ui.intentions.countOther),
    );
  });

  test('a contagem usa singular/plural corretamente', () => {
    expect(fill(ui.intentions.countOne, { n: 1 })).toBe('1 intenção recebida');
  });
});
