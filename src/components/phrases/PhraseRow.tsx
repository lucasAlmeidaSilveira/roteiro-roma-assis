'use client';

import { useEffect, useRef, useState } from 'react';

import { ExternalLink } from '@/components/ui/ExternalLink';
import { copyText, selectContents } from '@/lib/clipboard';
import { copy } from '@/lib/copy';
import { translateUrl } from '@/lib/links';
import type { Lang, Phrase } from '@/lib/schema';
import { speak } from '@/lib/speech';

import styles from './phrases.module.css';

export const COPIED_MS = 1500;

/** Uma frase: texto (lang), pronúncia, tradução, Ouvir/Copiar e o plano B do Tradutor (RF-07.3–7.5). */
export function PhraseRow({ phrase, lang }: { phrase: Phrase; lang: Lang }) {
  const [playing, setPlaying] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const copiedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  function listen() {
    speak(phrase.text, lang, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
      onFallback: () => {
        setPlaying(false);
        setFallback(true);
      },
    });
  }

  async function copyPhrase() {
    if (await copyText(phrase.text)) {
      setCopied(true);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } else {
      selectContents(textRef.current);
    }
  }

  return (
    <li>
      <span ref={textRef} className={styles.text} lang={lang}>
        {phrase.text}
      </span>
      <span className={styles.pron}>{phrase.pron}</span>
      <span className={styles.pt}>{phrase.pt}</span>
      <span className={styles.acts}>
        <button type="button" onClick={listen}>
          {playing ? copy.phrases.playing : copy.phrases.listen}
        </button>
        <button type="button" onClick={copyPhrase}>
          {copied ? copy.phrases.copied : copy.phrases.copy}
        </button>
      </span>
      {fallback && (
        <ExternalLink href={translateUrl(phrase.text, lang)} className={styles.fallback}>
          {copy.phrases.fallback}
        </ExternalLink>
      )}
    </li>
  );
}
