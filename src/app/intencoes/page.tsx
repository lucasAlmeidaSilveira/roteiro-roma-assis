import type { Metadata } from 'next';

import { IntentionsPanel } from '@/components/intentions/IntentionsPanel';
import { Card } from '@/components/ui/Card';
import { intentionMessage, intentionsConfig } from '@/lib/content';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: `${copy.intentions.title} — ${copy.brand}` };

/** Casca estática (RF-10): os dados vêm da API no cliente; "Onde levar" sempre visível. */
export default function IntentionsPage() {
  return (
    <main className="wrap">
      <IntentionsPanel message={intentionMessage()} />
      <Card title={copy.intentions.whereTitle}>
        <ul>
          {intentionsConfig.where.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
