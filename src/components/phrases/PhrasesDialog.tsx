'use client';

import { useEffect, useId, useRef } from 'react';

import { useLang } from '@/hooks/use-stored';
import { copy } from '@/lib/copy';
import type { Lang, PhraseSet } from '@/lib/schema';
import { initSpeech, stopSpeech } from '@/lib/speech';

import { PhraseRow } from './PhraseRow';
import styles from './phrases.module.css';

export type OpenPhrases = {
  set: PhraseSet;
  /** lugar do item (subtítulo) */
  place: string;
  /** botão "Idiomas" que abriu (recebe o foco de volta ao fechar) */
  trigger: HTMLButtonElement;
};

const LANGS: { lang: Lang; label: string }[] = [
  { lang: 'it', label: copy.phrases.italian },
  { lang: 'en', label: copy.phrases.english },
];

/** Popup "Idiomas" (RF-07): <dialog> nativo com showModal(), foco preso, Esc e backdrop fecham. */
export function PhrasesDialog({
  open,
  basic,
  onClose,
}: {
  open: OpenPhrases | null;
  basic: PhraseSet | undefined;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [lang, setLang] = useLang();
  const titleId = useId();

  useEffect(() => initSpeech(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = open.trigger;
    return () => {
      document.body.style.overflow = prevOverflow;
      stopSpeech();
      if (dialog.open) dialog.close();
      trigger.focus();
    };
  }, [open]);

  function changeLang(l: Lang) {
    if (l === lang) return;
    stopSpeech();
    setLang(l);
  }

  const set = open?.set;
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.head}>
          <div>
            <h3 id={titleId}>{set?.title ?? copy.phrases.defaultTitle}</h3>
            <p>{open?.place}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label={copy.phrases.close}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.langsw} role="group" aria-label={copy.phrases.langGroupAria}>
          {LANGS.map((l) => (
            <button
              key={l.lang}
              type="button"
              aria-pressed={lang === l.lang}
              onClick={() => changeLang(l.lang)}
            >
              {l.label}
            </button>
          ))}
        </div>
        {set && (
          <ul className={styles.list}>
            {set[lang].map((p) => (
              <PhraseRow key={`${lang}|${p.text}`} phrase={p} lang={lang} />
            ))}
          </ul>
        )}
        <h4 className={styles.always}>{copy.phrases.always}</h4>
        {basic && (
          <ul className={`${styles.list} ${styles.basic}`}>
            {basic[lang].map((p) => (
              <PhraseRow key={`${lang}|${p.text}`} phrase={p} lang={lang} />
            ))}
          </ul>
        )}
        <p className={styles.tip}>{copy.phrases.tip}</p>
      </div>
    </dialog>
  );
}
