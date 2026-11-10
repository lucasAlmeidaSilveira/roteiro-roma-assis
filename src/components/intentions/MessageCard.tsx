'use client';

import { useRef, useState } from 'react';

import { Card } from '@/components/ui/Card';
import ui from '@/components/ui/ui.module.css';
import { copyText } from '@/lib/clipboard';
import { copy } from '@/lib/copy';

/** "Mensagem para enviar" com cópia e plano B (seleciona o texto) — RF-10.4. */
export function MessageCard({ message }: { message: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState('');

  async function copyMessage() {
    if (await copyText(message)) {
      setStatus(copy.intentions.copied);
    } else {
      ref.current?.focus();
      ref.current?.select();
      setStatus(copy.intentions.copyFallback);
    }
  }

  return (
    <Card title={copy.intentions.messageTitle}>
      <textarea
        ref={ref}
        className={ui.msg}
        readOnly
        aria-label={copy.intentions.messageTitle}
        value={message}
      />
      <div className={ui.btns}>
        <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} onClick={copyMessage}>
          {copy.intentions.copyMessage}
        </button>
      </div>
      <p className={ui.status} role="status">
        {status}
      </p>
    </Card>
  );
}
