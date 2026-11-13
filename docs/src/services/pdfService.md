# `src/services/pdfService.ts`

> Extrai linha digitável de boletos em PDF, com fallback OCR para PDFs scanned.

## O que faz

- `readPdfWithOcr(buffer: Buffer)`: abre até 2 páginas do PDF com `unpdf`.
- Primeiro tenta OCR indireto via texto (`extractText`); se não achar, renderiza a página e roda OCR.
- Retorna `{ linhaDigitavel, pages, method }`.

## Relações

- **Usa:** `unpdf`, `pdfjs-dist`, `@napi-rs/canvas`, [`src/services/ocrService.ts`](./ocrService.md), [`src/services/boletoBarcode.ts`](./boletoBarcode.md).
- **Usado por:** [`src/pages/api/ocr.ts`](../pages/api/ocr.md).

## Notas

- PDFs com mais de 2 páginas são rejeitados.
- Não grava arquivos temporários.
