import { Details } from '@/components/ui/Details';
import { InlineText } from '@/components/ui/InlineText';
import ui from '@/components/ui/ui.module.css';
import { copy } from '@/lib/copy';
import type { DocContent } from '@/lib/schema';

/** "Resumo por dia" do documento (RF-08.4 / RF-13.2). */
export function PlacesSummary({ summary }: { summary: DocContent['placesSummary'] }) {
  return (
    <Details summary={copy.places.summaryTitle}>
      <p>
        <InlineText text={summary.intro} />
      </p>
      <div
        className={ui.tableWrap}
        role="region"
        aria-label={copy.places.summaryTitle}
        tabIndex={0}
      >
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Lugares</th>
              <th scope="col">Ingresso pago</th>
            </tr>
          </thead>
          <tbody>
            {summary.rows.map((r) => (
              <tr key={r.day}>
                <th scope="row">{r.day}</th>
                <td>{r.places}</td>
                <td>{r.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={ui.muted}>
        <InlineText text={summary.legend} />
      </p>
    </Details>
  );
}
