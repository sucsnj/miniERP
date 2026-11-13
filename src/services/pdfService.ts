import {
  extractText,
  getDocumentProxy,
} from 'unpdf';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractDigitableLineFromText } from './boletoBarcode';
import { readDigitableLine } from './ocrService';

class CanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return {
      canvas,
      context: canvas.getContext('2d', { alpha: false }),
    };
  }

  reset() {}

  destroy() {}

  getNoAlphaContext(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return canvas.getContext('2d', { alpha: false });
  }
}

const ensurePromiseTry = () => {
  if (typeof Promise.try === 'function') return;
  (Promise as unknown as { try: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> }).try =
    <T>(fn: (...args: unknown[]) => T | Promise<T>, ...args: unknown[]) =>
      Promise.resolve().then(() => fn(...args));
};

const renderPage = async (buffer: Buffer, pageNumber: number) => {
  ensurePromiseTry();

  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    CanvasFactory,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  if (pageNumber > pdf.numPages) {
    throw new Error('Página PDF inválida.');
  }

  const page = await pdf.getPage(pageNumber);
  const pageViewport = page.getViewport({ scale: 1 });
  const scale = 2200 / pageViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));

  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    viewport,
    annotationMode: 0,
  }).promise;

  const result = canvas.toBuffer('image/png');
  await loadingTask.destroy();
  return result;
};

const MAX_PDF_PAGES = 2;

export interface PdfOcrResult {
  linhaDigitavel: string | null;
  pages: number;
  method: 'text' | 'ocr' | null;
}

export const readPdfWithOcr = async (buffer: Buffer): Promise<PdfOcrResult> => {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new Error('O PDF deve ter no máximo 2 páginas.');
  }
  const pages = pdf.numPages;

  const { text } = await extractText(pdf, { mergePages: true });
  const lineFromText = extractDigitableLineFromText(text);

  if (lineFromText) {
    return { linhaDigitavel: lineFromText, pages, method: 'text' };
  }

  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const image = await renderPage(buffer, pageNumber);

    const line = await readDigitableLine(image);
    if (line) {
      return { linhaDigitavel: line, pages, method: 'ocr' };
    }
  }

  return { linhaDigitavel: null, pages, method: null };
};
