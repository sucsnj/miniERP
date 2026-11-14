/**
 * src/utils/pixActions.ts
 *
 * Ações do painel PIX que não pertencem ao layout do PDF de impressão.
 * Notificações usam o store global de toasts (`utils/toast.ts`).
 */

import { generateHighResPng } from '@/utils/qrPix';
import { downloadDataUrl } from '@/utils/download';

/**
 * Baixa o QR Code em PNG de alta resolução.
 */
export async function downloadQrPng(payload: string): Promise<void> {
  const dataUrl = await generateHighResPng(payload);
  downloadDataUrl(dataUrl, `pix-qrcode-${new Date().toISOString().slice(0, 10)}.png`);
}
