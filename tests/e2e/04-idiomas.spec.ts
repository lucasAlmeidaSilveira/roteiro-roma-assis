import { expect, test, type Page } from '@playwright/test';

import { translateUrl } from '../../src/lib/links';

import { LEGACY, fakeSpeech, fase, go, item, itemUsing, phrases, routes, ui } from './support';

async function openPopup(page: Page, day: number, id: string) {
  await go(page, routes.day(day));
  const btn = item(page, id).getByRole('button', { name: ui.day.languages });
  await btn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return { btn, dialog };
}

test.describe('Fase 4 · botão Idiomas (popup com italiano e inglês)', () => {
  fase(4);

  test('abre com as frases do lugar em italiano, as básicas e a dica', async ({ page }) => {
    const { dialog } = await openPopup(page, 14, '14-11');
    const set = phrases.museo!;
    await expect(dialog).toHaveAccessibleName(set.title);
    await expect(dialog).toContainText('Museus do Vaticano e Capela Sistina');
    await expect(dialog.getByRole('button', { name: ui.phrases.italian })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const p of [...set.it, ...phrases.basic!.it]) {
      await expect(dialog.getByText(p.text, { exact: true }).first()).toBeVisible();
      await expect(dialog.getByText(p.pron, { exact: true }).first()).toBeVisible();
      await expect(dialog.getByText(p.pt, { exact: true }).first()).toBeVisible();
    }
    const total = set.it.length + phrases.basic!.it.length;
    await expect(dialog.getByRole('button', { name: ui.phrases.listen })).toHaveCount(total);
    await expect(dialog.getByRole('button', { name: ui.phrases.copy })).toHaveCount(total);
    await expect(dialog).toContainText(ui.phrases.always);
    await expect(dialog).toContainText(ui.phrases.tip);
  });

  test('troca para inglês e lembra a escolha', async ({ page }) => {
    const { dialog } = await openPopup(page, 14, '14-11');
    await dialog.getByRole('button', { name: ui.phrases.english }).click();
    await expect(dialog.getByRole('button', { name: ui.phrases.english })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const p of phrases.museo!.en)
      await expect(dialog.getByText(p.text, { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText(phrases.museo!.it[0]!.text, { exact: true })).toHaveCount(0);
    await page.reload();
    const again = await openPopup(page, 14, '14-11');
    await expect(again.dialog.getByRole('button', { name: ui.phrases.english })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('Esc fecha e devolve o foco ao botão; "Fechar" também fecha', async ({ page }) => {
    const { btn, dialog } = await openPopup(page, 15, '15-4');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(btn).toBeFocused();
    await btn.click();
    await page.getByRole('dialog').getByRole('button', { name: ui.phrases.close }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('Ouvir: fala em it-IT e mostra "Tocando…"', async ({ page }) => {
    await fakeSpeech(page, 'start');
    const { dialog } = await openPopup(page, 14, '14-11');
    const first = phrases.museo!.it[0]!;
    const listen = dialog.getByRole('button', { name: ui.phrases.listen }).first();
    await listen.click();
    await expect(dialog.getByRole('button', { name: ui.phrases.playing })).toBeVisible();
    await expect(dialog.getByRole('button', { name: ui.phrases.playing })).toHaveCount(0, {
      timeout: 5000,
    });
    const spoken = await page.evaluate(
      () => (window as unknown as { __spoken: string[] }).__spoken,
    );
    expect(spoken[0]).toBe(`it-IT|${first.text.replace(/…/g, '').trim()}`);
  });

  test('Ouvir sem áudio: depois de 2,5 s mostra o link do Google Tradutor', async ({ page }) => {
    await fakeSpeech(page, 'silent');
    const { dialog } = await openPopup(page, 14, '14-11');
    await dialog.getByRole('button', { name: ui.phrases.listen }).first().click();
    const link = dialog.getByRole('link', { name: ui.phrases.fallback });
    await expect(link).toBeVisible({ timeout: 5000 });
    await expect(link).toHaveAttribute('href', translateUrl(phrases.museo!.it[0]!.text, 'it'));
  });

  test('Copiar copia a frase', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const { dialog } = await openPopup(page, 14, '14-11');
    await dialog.getByRole('button', { name: ui.phrases.copy }).first().click();
    await expect(dialog.getByRole('button', { name: ui.phrases.copied })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      phrases.museo!.it[0]!.text,
    );
  });

  for (const key of Object.keys(phrases).filter((k) => k !== 'basic')) {
    test(`conjunto "${key}" completo em italiano e inglês`, async ({ page }) => {
      const { day, item: it } = itemUsing(key);
      const { dialog } = await openPopup(page, day.day, it.id);
      const set = phrases[key]!;
      await expect(dialog).toHaveAccessibleName(set.title);
      for (const p of set.it)
        await expect(dialog.getByText(p.text, { exact: true }).first()).toBeVisible();
      await dialog.getByRole('button', { name: ui.phrases.english }).click();
      for (const p of set.en)
        await expect(dialog.getByText(p.text, { exact: true }).first()).toBeVisible();
      for (const p of phrases.basic!.en)
        await expect(dialog.getByText(p.text, { exact: true }).first()).toBeVisible();
      if (LEGACY) return;
      // app novo: lang certo nas frases (leitores de tela pronunciam no idioma certo)
      await expect(dialog.locator('[lang="en"]').first()).toBeVisible();
    });
  }
});
