import { expect, test, type Page } from '@playwright/test';

import { fill, plural } from '../../src/lib/format';

import { fase, go, intentions, routes, ui } from './support';

const PASS = 'teste-123'; // OWNER_PASSCODE do playwright.config.ts
const message = intentions.messageTemplate.replace('{formUrl}', intentions.formUrl);

async function login(page: Page, code = PASS) {
  await go(page, routes.intentions);
  await page.getByLabel(ui.intentions.loginLabel).fill(code);
  await page.getByRole('button', { name: ui.intentions.loginButton }).click();
}

test.describe('Fase 7 · @novo Intenções (só para o dono)', () => {
  fase(7);

  test('visitante vê só o aviso, o acesso e "Onde levar"', async ({ page }) => {
    await go(page, routes.intentions);
    const main = page.locator('main');
    await expect(main).toContainText(ui.intentions.ownerOnly);
    await expect(page.getByLabel(ui.intentions.loginLabel)).toBeVisible();
    await expect(main).not.toContainText('Pela paz no mundo');
    await expect(main).not.toContainText(ui.intentions.messageTitle);
    await expect(main).toContainText(ui.intentions.whereTitle);
    for (const w of intentions.where) await expect(main).toContainText(w);
  });

  test('a API recusa quem não entrou', async ({ request }) => {
    const res = await request.get('/api/intencoes');
    expect(res.status()).toBe(401);
    expect(res.headers()['cache-control']).toContain('no-store');
  });

  test('código errado mostra erro; certo mostra as intenções (mais novas primeiro)', async ({
    page,
  }) => {
    await login(page, 'errado');
    await expect(page.getByText(ui.intentions.loginError)).toBeVisible();

    await login(page);
    const main = page.locator('main');
    await expect(main).toContainText(plural(3, ui.intentions.countOne, ui.intentions.countOther));
    const items = main.getByRole('listitem').filter({ hasText: /Pela|Em ação/ });
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('Em ação de graças');
    await expect(items.nth(0)).toContainText('João');
    await expect(items.nth(1)).toContainText('Pela saúde da família');
    await expect(items.nth(2)).toContainText('Maria');
    await expect(main).toContainText(/Atualizado às \d{2}:\d{2}\. As mais novas no topo\./);
    await expect(main).not.toContainText('Linha vazia');
  });

  test('mensagem para enviar, copiar, atualizar e sair', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await login(page);
    await expect(page.getByRole('textbox')).toHaveValue(message);
    await page.getByRole('button', { name: ui.intentions.copyMessage }).click();
    await expect(page.getByText(ui.intentions.copied)).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(message);

    const api = page.waitForResponse(
      (r) => r.url().endsWith('/api/intencoes') && r.status() === 200,
    );
    await page.getByRole('button', { name: ui.intentions.refresh }).click();
    await api;

    const json = await (await page.request.get('/api/intencoes')).json();
    expect(json.items).toHaveLength(3);

    await page.getByRole('button', { name: ui.intentions.logout }).click();
    await expect(page.locator('main')).toContainText(ui.intentions.ownerOnly);
    expect((await page.request.get('/api/intencoes')).status()).toBe(401);
  });

  test('a contagem usa singular/plural corretamente', () => {
    expect(fill(ui.intentions.countOne, { n: 1 })).toBe('1 intenção recebida');
  });
});
