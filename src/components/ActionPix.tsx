/**
 * src/components/actions.ts
 *
 * Ações do painel: copiar "PIX Copia e Cola", baixar PNG de alta
 * resolução, imprimir a folha do PIX e notificações (toast).
 */

import QRCode from 'qrcode';
import { generateHighResPng } from '@/components/QrPix';

// ---------------------------------------------------------------------------
// Tipos e Interfaces
// ---------------------------------------------------------------------------

export type ToastType = 'success' | 'error';

export interface PrintSheetData {
  payload: string;
  name: string;
  bank: string;
  amount: string | null;
  key: string;
}

const TOAST_MS = 2600;

/**
 * Exibe um toast temporário.
 */
export function showToast(message: string, type: ToastType = 'success'): void {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  const iconColor = type === 'success' ? 'text-emerald-400' : 'text-rose-400';
  const iconSvg =
    type === 'success'
      ? '<polyline points="20 6 9 17 4 12"/>'
      : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';

  toast.className =
    'flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium ' +
    'text-white shadow-2xl ring-1 ring-white/10 toast-enter';

  toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 ${iconColor}" aria-hidden="true">${iconSvg}</svg><span></span>`;
  
  const span = toast.querySelector('span');
  if (span) {
    span.textContent = message;
  }
  
  root.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('toast-leave');
    toast.addEventListener(
      'transitionend',
      () => toast.remove(),
      { once: true },
    );
    window.setTimeout(() => toast.remove(), 400);
  }, TOAST_MS);
}

/**
 * Copia texto para a área de transferência com fallback.
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

/**
 * Baixa o QR Code em PNG de alta resolução.
 */
export async function downloadQrPng(payload: string): Promise<void> {
  const dataUrl = await generateHighResPng(payload);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `pix-qrcode-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
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