import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { translateUrl } from '@/lib/links';
import type { SpeakHandlers } from '@/lib/speech';

import { PhraseRow } from './PhraseRow';

const speak = vi.hoisted(() => vi.fn<(text: string, lang: string, h: SpeakHandlers) => void>());
vi.mock('@/lib/speech', () => ({ speak }));

const phrase = { text: 'Buongiorno, vorrei…', pron: 'buon-DJOR-no', pt: 'Bom dia, eu gostaria…' };

describe('PhraseRow (RF-07.3–7.5)', () => {
  beforeEach(() => speak.mockReset());
  afterEach(() => vi.useRealTimers());

  it('texto com lang, pronúncia e tradução; botões Ouvir e Copiar', () => {
    render(
      <ul>
        <PhraseRow phrase={phrase} lang="it" />
      </ul>,
    );
    expect(screen.getByText(phrase.text)).toHaveAttribute('lang', 'it');
    expect(screen.getByText(phrase.pron)).toBeInTheDocument();
    expect(screen.getByText(phrase.pt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('fala que começa: "Tocando…" até terminar', async () => {
    const user = userEvent.setup();
    render(
      <ul>
        <PhraseRow phrase={phrase} lang="it" />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: 'Ouvir' }));
    expect(speak).toHaveBeenCalledWith(phrase.text, 'it', expect.any(Object));
    const h = speak.mock.calls[0]![2];
    act(() => h.onStart?.());
    expect(screen.getByRole('button', { name: 'Tocando…' })).toBeInTheDocument();
    act(() => h.onEnd?.());
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('fala que nunca começa (ou erro): mostra o link do Google Tradutor', async () => {
    const user = userEvent.setup();
    render(
      <ul>
        <PhraseRow phrase={phrase} lang="en" />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: 'Ouvir' }));
    act(() => speak.mock.calls[0]![2].onFallback());
    const link = screen.getByRole('link', {
      name: 'Sem áudio neste navegador. Ouvir no Google Tradutor ↗',
    });
    expect(link).toHaveAttribute('href', translateUrl(phrase.text, 'en'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
  });

  it('Copiar: "Copiado" por 1,5 s', async () => {
    const user = userEvent.setup();
    render(
      <ul>
        <PhraseRow phrase={phrase} lang="it" />
      </ul>,
    );
    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(phrase.text);
    expect(
      await screen.findByRole('button', { name: 'Copiar' }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
