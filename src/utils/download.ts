/**
 * src/utils/download.ts
 *
 * Disparo de download de arquivos no navegador.
 */

/**
 * Baixa um Data URL (ex.: PNG) com o nome de arquivo informado.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}