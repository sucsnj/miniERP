/**
 * src/utils/clipboard.ts
 *
 * Cópia de texto para a área de transferência com fallback para
 * navegadores em contexto não seguro (`document.execCommand`).
 */

/**
 * Copia texto para a área de transferência.
 */
export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: (e: unknown) => void
): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const ok = document.execCommand('copy');
      textArea.remove();
      if (!ok) throw new Error('execCommand falhou');
    }
    onSuccess?.();
  } catch (err) {
    onError?.(err);
  }
}