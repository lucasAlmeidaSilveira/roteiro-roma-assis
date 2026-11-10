import { copy } from '@/lib/copy';
import { mapUrl } from '@/lib/links';

import { ExternalLink } from './ExternalLink';
import styles from './ui.module.css';

/** "Mapa ↗" para uma busca do Google Maps (nova aba). `plain` = link de texto, sem borda. */
export function MapLink({
  query,
  className,
  plain,
}: {
  query: string;
  className?: string;
  plain?: boolean;
}) {
  return (
    <ExternalLink
      href={mapUrl(query)}
      className={plain ? undefined : (className ?? styles.maplink)}
    >
      {copy.day.map}
    </ExternalLink>
  );
}
