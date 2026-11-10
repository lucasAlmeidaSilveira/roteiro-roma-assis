/** Copia texto. Retorna false quando o navegador não deixa (a UI então seleciona o texto). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Seleciona o conteúdo de um elemento para o usuário copiar manualmente. */
export function selectContents(el: Element | null): void {
  if (!el) return;
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } catch {
    /* ok */
  }
}
