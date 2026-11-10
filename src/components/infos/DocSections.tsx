import { Details } from '@/components/ui/Details';
import { InlineText } from '@/components/ui/InlineText';
import ui from '@/components/ui/ui.module.css';
import { copy } from '@/lib/copy';
import type { DocContent, EventProgram } from '@/lib/schema';

import { Checklist } from './Checklist';
import { KeyValueGrid } from './KeyValueCard';

/** Conteúdo do documento na aba Infos (RF-09.6 / RF-13.3), cada bloco num <details>. */
export function DocSections({ doc, event }: { doc: DocContent; event: EventProgram }) {
  return (
    <>
      <Details summary={copy.infos.overviewTitle}>
        <p>
          <InlineText text={doc.overview.lead} />
        </p>
        <ul>
          {doc.overview.bullets.map((b) => (
            <li key={b.title}>
              <strong>{b.title}</strong> <InlineText text={b.text} />
            </li>
          ))}
        </ul>
        <p>
          <InlineText text={doc.overview.premise} />
        </p>
      </Details>

      <Details summary={copy.infos.transportRoutesTitle}>
        <p>
          <InlineText text={doc.transport.intro} />
        </p>
        <div
          className={ui.tableWrap}
          role="region"
          aria-label={copy.infos.transportRoutesTitle}
          tabIndex={0}
        >
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Trajeto</th>
                <th scope="col">Como ir</th>
                <th scope="col">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {doc.transport.routes.map((r) => (
                <tr key={r.route}>
                  <th scope="row">{r.route}</th>
                  <td>{r.how}</td>
                  <td>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <InlineText text={doc.transport.prices} />
        </p>
      </Details>

      <Details summary={doc.hotels.title}>
        <p>
          <InlineText text={doc.hotels.intro} />
        </p>
        <p className={ui.muted}>
          <InlineText text={doc.hotels.note} />
        </p>
        <ul>
          {doc.hotels.options.map((h) => (
            <li key={h.name}>
              <strong>{h.name}</strong> · {h.rating} · {h.price}
              <br />
              <span className={ui.muted}>{h.why}</span>
            </li>
          ))}
        </ul>
        <p>
          <InlineText text={doc.hotels.extra} />
        </p>
        <p>
          <InlineText text={doc.hotels.suggestion} />
        </p>
      </Details>

      <Details summary={copy.infos.eventTitle}>
        <p className={ui.muted}>{event.title}</p>
        {event.days.map((d) => (
          <div key={d.date}>
            <h4>{d.heading}</h4>
            {d.place && <p className={ui.muted}>{d.place}</p>}
            {d.theme && (
              <p>
                <em>{d.theme}</em>
              </p>
            )}
            <ul>
              {d.schedule.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
        <h4>Convidados</h4>
        <ul>
          {event.guests.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Details>

      <Details summary={copy.infos.decisionsTitle}>
        <p>
          <InlineText text={doc.decisions.intro} />
        </p>
        <Checklist
          items={doc.decisions.items.map((d) => ({ id: d.id, text: d.text, defaultDone: d.done }))}
          seedKey="decisoes-semeadas-v1"
        />
      </Details>

      <Details summary={copy.infos.budgetDetailsTitle}>
        <p>
          <InlineText text={doc.budgetDetails.intro} />
        </p>
        <KeyValueGrid
          rows={doc.budgetDetails.rows.map((r) => ({ label: r.category, value: r.range }))}
        />
        <p className={ui.muted}>
          <InlineText text={doc.budgetDetails.note} />
        </p>
      </Details>

      <Details summary={copy.infos.sourcesTitle}>
        <p className={ui.muted}>
          <InlineText text={doc.sources.note} />
        </p>
        <ol>
          {doc.sources.items.map((s, i) => (
            <li key={i}>
              <InlineText text={s} />
            </li>
          ))}
        </ol>
      </Details>
    </>
  );
}
