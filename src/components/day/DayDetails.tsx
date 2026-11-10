import { Details } from '@/components/ui/Details';
import { InlineText } from '@/components/ui/InlineText';
import { copy } from '@/lib/copy';
import type { Day } from '@/lib/schema';

/** "Mais detalhes do roteiro" (RF-03.7 / RF-13.1): introdução + dicas do documento. */
export function DayDetails({ details }: { details: NonNullable<Day['details']> }) {
  return (
    <Details summary={copy.day.detailsSummary}>
      <p>
        <InlineText text={details.intro} />
      </p>
      {details.tips.map((tip, i) => (
        <p key={i}>
          <InlineText text={tip} />
        </p>
      ))}
    </Details>
  );
}
