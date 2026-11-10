/**
 * src/utils/pixActions.ts
 *
 * Ações do painel PIX: baixar PNG de alta resolução e imprimir a folha
 * do PIX. Notificações usam o store global de toasts (`utils/toast.ts`).
 */

import QRCode from 'qrcode';
import { generateHighResPng } from '@/utils/qrPix';
import { downloadDataUrl } from '@/utils/download';

// ---------------------------------------------------------------------------
// Tipos e Interfaces
// ---------------------------------------------------------------------------

export interface PrintSheetData {
  payload: string;
  name: string;
  bank: string;
  amount: string | null;
  key: string;
}

/**
 * Baixa o QR Code em PNG de alta resolução.
 */
export async function downloadQrPng(payload: string): Promise<void> {
  const dataUrl = await generateHighResPng(payload);
  downloadDataUrl(dataUrl, `pix-qrcode-${new Date().toISOString().slice(0, 10)}.png`);
}

/**
 * Preenche a folha de impressão com os dados atuais + QR Code (alta resolução)
 * e dispara o window.print().
 */
export async function printPixSheet(data: PrintSheetData): Promise<void> {
  const canvas = document.getElementById('print-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  await generatePrintQr(canvas, data.payload);

  const setTextContent = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setTextContent('print-name', data.name || '—');
  setTextContent('print-bank', data.bank || '—');
  setTextContent('print-amount', data.amount ? formatBRL(data.amount) : 'Valor aberto');
  setTextContent('print-key', data.key || '—');
  setTextContent(
    'print-date',
    new Date().toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  );
  setTextContent('print-code', data.payload);

  document.body.classList.add('printing');
  window.print();
  window.setTimeout(() => document.body.classList.remove('printing'), 300);
}

async function generatePrintQr(canvas: HTMLCanvasElement, payload: string): Promise<void> {
  await QRCode.toCanvas(canvas, payload, {
    width: 240,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });
}

/** Formata "15.00" como "R$ 15,00". */
function formatBRL(value: string | number): string {
  const parts = String(value).split('.');
  const reais = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const cents = (parts[1] || '').padEnd(2, '0');
  return `R$ ${reais},${cents}`;
}