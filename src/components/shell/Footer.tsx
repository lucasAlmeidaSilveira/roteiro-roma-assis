import { copy } from '@/lib/copy';

/** Rodapé fora do <main> (RF-01.5). */
export function Footer() {
  return (
    <div className="wrap">
      <footer>{copy.footer}</footer>
    </div>
  );
}
