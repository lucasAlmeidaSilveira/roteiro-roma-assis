import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SPEECH_TIMING, speak } from '@/lib/speech';
import { parseDone, readStorage, subscribeStorage, writeStorage } from '@/lib/storage';

describe('armazenamento local', () => {
  beforeEach(() => localStorage.clear());

  it('parseDone tolera lixo', () => {
    expect(parseDone(null)).toEqual({});
    expect(parseDone('{')).toEqual({});
    expect(parseDone('[1]')).toEqual({});
    expect(parseDone('{"14-0":1,"14-1":0,"todo-2":true}')).toEqual({ '14-0': 1, 'todo-2': 1 });
  });

  it('grava, lê e avisa os assinantes', () => {
    const cb = vi.fn();
    const off = subscribeStorage(cb);
    writeStorage('k', 'v');
    expect(readStorage('k')).toBe('v');
    expect(cb).toHaveBeenCalledTimes(1);
    off();
    writeStorage('k', null);
    expect(readStorage('k')).toBeNull();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('continua funcionando (em memória) quando o localStorage é bloqueado', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    writeStorage('roteiro-roma-idioma', 'en');
    expect(readStorage('roteiro-roma-idioma')).toBe('en');
  });
});

type FakeUtterance = {
  text: string;
  lang: string;
  rate: number;
  volume: number;
  voice: unknown;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

describe('fala (Web Speech API)', () => {
  let spoken: FakeUtterance[];
  let synth: {
    speaking: boolean;
    pending: boolean;
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    getVoices: () => { lang: string }[];
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    spoken = [];
    synth = {
      speaking: false,
      pending: false,
      speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
      cancel: vi.fn(),
      resume: vi.fn(),
      getVoices: () => [{ lang: 'it-IT' }, { lang: 'en-GB' }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        rate = 1;
        volume = 1;
        voice: unknown = null;
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(public text: string) {}
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('fala em italiano a 0,9, sem reticências, chamando resume() antes', () => {
    const onFallback = vi.fn();
    speak('Vorrei…', 'it', { onFallback });
    expect(synth.resume).toHaveBeenCalled();
    expect(spoken[0]).toMatchObject({ text: 'Vorrei', lang: 'it-IT', rate: SPEECH_TIMING.rate });
    spoken[0]!.onstart?.();
    vi.advanceTimersByTime(SPEECH_TIMING.fallbackMs + 10);
    expect(onFallback).not.toHaveBeenCalled();
  });

  it('se já estiver falando: cancela e espera 150 ms antes de falar (bug do iOS)', () => {
    synth.speaking = true;
    speak('Hello', 'en', { onFallback: vi.fn() });
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SPEECH_TIMING.retryDelayMs);
    expect(spoken[0]).toMatchObject({ lang: 'en-US' });
  });

  it('mostra o plano B se a fala não começar em 2,5 s ou der erro antes de começar', () => {
    const a = vi.fn();
    speak('Ciao', 'it', { onFallback: a });
    vi.advanceTimersByTime(SPEECH_TIMING.fallbackMs);
    expect(a).toHaveBeenCalledTimes(1);

    const b = vi.fn();
    speak('Ciao', 'it', { onFallback: b });
    spoken.at(-1)!.onerror?.();
    expect(b).toHaveBeenCalled();
  });

  it('sem Web Speech API: plano B imediato', () => {
    vi.unstubAllGlobals();
    // jsdom não tem speechSynthesis
    const f = vi.fn();
    speak('Ciao', 'it', { onFallback: f });
    expect(f).toHaveBeenCalledTimes(1);
  });
});
