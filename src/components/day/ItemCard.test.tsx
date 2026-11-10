import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Item } from '@/lib/schema';
import { mapUrl } from '@/lib/links';

import { ItemCard } from './ItemCard';

const base: Item = {
  id: '14-11',
  start: '15:30',
  label: '15h30',
  place: 'Museus do Vaticano e Capela Sistina',
  action: 'Entrar no horário marcado.',
  cost: '€25',
  mapQuery: 'Musei Vaticani',
  paid: true,
  phrases: 'museo',
};

function setup(item: Item, extra: Partial<Parameters<typeof ItemCard>[0]> = {}) {
  const onDone = vi.fn();
  const onOpenPhrases = vi.fn();
  render(
    <ol>
      <ItemCard
        item={item}
        done={false}
        isNow={false}
        onDone={onDone}
        onOpenPhrases={onOpenPhrases}
        {...extra}
      />
    </ol>,
  );
  return { onDone, onOpenPhrases };
}

describe('ItemCard (RF-05)', () => {
  it('ingresso pago: chip "Ingresso €25", mapa e id de contrato', () => {
    setup(base);
    const li = document.getElementById('it-14-11');
    expect(li).not.toBeNull();
    expect(li).toHaveTextContent('Ingresso €25');
    expect(screen.getByRole('link', { name: 'Mapa ↗' })).toHaveAttribute(
      'href',
      mapUrl('Musei Vaticani'),
    );
    expect(screen.queryByText('Convenção')).toBeNull();
  });

  it('custo normal sem prefixo; sem custo ("—") não mostra chip; sem mapa não mostra link', () => {
    setup({ ...base, id: '14-1', cost: 'grátis', paid: undefined, mapQuery: undefined });
    expect(screen.getByText('grátis')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Mapa ↗' })).toBeNull();
    expect(document.body.textContent).not.toContain('Ingresso');
  });

  it('compromisso da Convenção mostra o selo', () => {
    setup({ ...base, id: '15-3', cost: '—', event: true, paid: undefined });
    expect(screen.getByText('Convenção')).toBeInTheDocument();
    expect(screen.queryByText('—')).toBeNull();
  });

  it('item em andamento recebe aria-current="time"', () => {
    setup(base, { isNow: true });
    expect(document.getElementById('it-14-11')).toHaveAttribute('aria-current', 'time');
  });

  it('"Feito" chama onDone; "Idiomas" abre o popup com o item e o botão', async () => {
    const user = userEvent.setup();
    const { onDone, onOpenPhrases } = setup(base);
    await user.click(screen.getByRole('checkbox', { name: 'Feito' }));
    expect(onDone).toHaveBeenCalledWith('14-11', true);
    const btn = screen.getByRole('button', { name: 'Idiomas' });
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(btn);
    expect(onOpenPhrases).toHaveBeenCalledWith(base, btn);
  });
});
