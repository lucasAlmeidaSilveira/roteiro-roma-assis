import type { Lang } from './schema';

/** Link de busca do Google Maps (mesmo formato do site antigo). */
export function mapUrl(query: string): string {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

/** Texto limpo para fala/tradução (remove reticências "…" de modelos como "Vorrei…"). */
export function speechText(text: string): string {
  return text.replace(/…/g, '').trim();
}

/** Plano B do áudio: abre o Google Tradutor com a frase (idioma → português). */
export function translateUrl(text: string, lang: Lang): string {
  return (
    `https://translate.google.com/?sl=${lang}&tl=pt&op=translate&text=` +
    encodeURIComponent(speechText(text))
  );
}
