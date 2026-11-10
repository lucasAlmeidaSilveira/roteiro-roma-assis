import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useNowMinute } from '@/hooks/use-now';
import { useDoneMap, useLang } from '@/hooks/use-stored';
import { STORAGE_KEYS } from '@/lib/storage';

describe('hooks de armazenamento', () => {
  beforeEach(() => localStorage.clear());

  it('useDoneMap marca e desmarca, gravando no formato do site antigo', () => {
    const { result } = renderHook(() => useDoneMap());
    expect(result.current.done).toEqual({});
    act(() => result.current.setDone('14-0', true));
    expect(result.current.done).toEqual({ '14-0': 1 });
    expect(localStorage.getItem(STORAGE_KEYS.done)).toBe('{"14-0":1}');
    act(() => result.current.setDone('14-0', false));
    expect(result.current.done).toEqual({});
  });

  it('useLang começa em italiano e lembra a escolha', () => {
    const { result } = renderHook(() => useLang());
    expect(result.current[0]).toBe('it');
    act(() => result.current[1]('en'));
    expect(result.current[0]).toBe('en');
    expect(localStorage.getItem(STORAGE_KEYS.lang)).toBe('en');
  });
});

describe('useNowMinute', () => {
  it('no cliente devolve o minuto atual', () => {
    const { result } = renderHook(() => useNowMinute());
    expect(result.current).toBe(Math.floor(Date.now() / 60_000));
  });
});
