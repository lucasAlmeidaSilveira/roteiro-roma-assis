import { RedirectToToday } from '@/components/home/RedirectToToday';
import { days } from '@/lib/content';

/**
 * "/" abre o dia de hoje em Roma (ou o dia 14 fora da viagem) — RF-01.6.
 * Não usa <main>: o Next 16 mantém a rota anterior escondida no DOM (<Activity>), e o <main> da página
 * do dia precisa ser o único (contrato dos testes e um só landmark principal por página).
 */
export default function Home() {
  return (
    <div className="wrap page">
      <RedirectToToday days={days.map((d) => ({ day: d.day, weekday: d.weekday }))} />
    </div>
  );
}
