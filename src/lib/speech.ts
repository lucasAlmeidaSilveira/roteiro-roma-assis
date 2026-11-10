/**
 * Fala das frases (Web Speech API) com os ajustes que funcionaram no iPhone (Safari/Arc):
 * - as vozes carregam depois (evento voiceschanged) → recarrega a voz se ainda não houver;
 * - cancel() colado no speak() falha no iOS → se algo estiver falando, cancela e espera 150 ms;
 * - resume() antes de speak() destrava o motor no iOS;
 * - se a fala não começar em 2,5 s (ou não existir), mostra o plano B (Google Tradutor).
 * Modo silencioso do iPhone deixa a fala muda: a dica do popup explica isso.
 */
import { speechText } from './links';
import type { Lang } from './schema';

type Voices = { it: SpeechSynthesisVoice | null; en: SpeechSynthesisVoice | null };
const voices: Voices = { it: null, en: null };

export const SPEECH_TIMING = { fallbackMs: 2500, retryDelayMs: 150, rate: 0.9 } as const;

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined')
    return null;
  return window.speechSynthesis;
}

export function loadVoices(): void {
  try {
    const list = synth()?.getVoices() ?? [];
    voices.it =
      list.find((v) => /^it[-_]IT/i.test(v.lang)) ?? list.find((v) => /^it/i.test(v.lang)) ?? null;
    voices.en =
      list.find((v) => /^en[-_]US/i.test(v.lang)) ??
      list.find((v) => /^en[-_]GB/i.test(v.lang)) ??
      list.find((v) => /^en/i.test(v.lang)) ??
      null;
  } catch {
    /* sem vozes: o navegador escolhe pelo idioma */
  }
}

/** Chame uma vez ao montar o app (ou o popup). Retorna a limpeza. */
export function initSpeech(): () => void {
  const s = synth();
  if (!s) return () => {};
  loadVoices();
  s.addEventListener('voiceschanged', loadVoices);
  return () => s.removeEventListener('voiceschanged', loadVoices);
}

export type SpeakHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
  /** Mostrar o link do Google Tradutor e voltar o botão para "Ouvir". */
  onFallback: () => void;
};

export function speak(text: string, lang: Lang, h: SpeakHandlers): void {
  const s = synth();
  if (!s) {
    h.onFallback();
    return;
  }
  try {
    if (!voices[lang]) loadVoices();
    const u = new window.SpeechSynthesisUtterance(speechText(text));
    u.lang = lang === 'en' ? 'en-US' : 'it-IT';
    u.rate = SPEECH_TIMING.rate;
    u.volume = 1;
    const v = voices[lang];
    if (v) u.voice = v;
    let started = false;
    u.onstart = () => {
      started = true;
      h.onStart?.();
    };
    u.onend = () => h.onEnd?.();
    u.onerror = () => (started ? h.onEnd?.() : h.onFallback());
    const go = () => {
      try {
        s.resume();
      } catch {
        /* ok */
      }
      s.speak(u);
    };
    if (s.speaking || s.pending) {
      s.cancel();
      window.setTimeout(go, SPEECH_TIMING.retryDelayMs);
    } else {
      go();
    }
    window.setTimeout(() => {
      if (!started) h.onFallback();
    }, SPEECH_TIMING.fallbackMs);
  } catch {
    h.onFallback();
  }
}

/** Para qualquer fala (ao fechar o popup ou trocar o idioma). */
export function stopSpeech(): void {
  try {
    synth()?.cancel();
  } catch {
    /* ok */
  }
}
