/**
 * src/components/qr.ts
 *
 * Renderização do QR Code usando a biblioteca `qrcode` e utilitários
 * para exportação em PNG de alta resolução e re-renderização animada.
 */

import QRCode, { QRCodeErrorCorrectionLevel } from 'qrcode';

export const QR_SIZE = 280;
const ERROR_CORRECTION: QRCodeErrorCorrectionLevel = 'M';

/**
 * Renderiza o payload no canvas.
 */
export function renderQr(
  canvas: HTMLCanvasElement,
  payload: string,
  size: number = QR_SIZE
): Promise<void> {
  return QRCode.toCanvas(canvas, payload, {
    width: size,
    margin: 2,
    errorCorrectionLevel: ERROR_CORRECTION,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Gera um Data URL PNG de alta resolução.
 */
export function generateHighResPng(
  payload: string,
  scale: number = 12
): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: QR_SIZE,
    scale: scale,
    margin: 2,
    errorCorrectionLevel: ERROR_CORRECTION,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Dispara a animação de entrada do QR Code ao ser atualizado.
 */
export function pulseQr(target: HTMLElement | null): void {
  if (!target) return;
  target.classList.remove('qr-anim');
  // Força reflow para reiniciar a animação CSS.
  void target.getBoundingClientRect();
  target.classList.add('qr-anim');
}