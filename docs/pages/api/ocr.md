# `src/pages/api/ocr.ts`

> OCR de boletos: recebe PDFs/imagens, lê a linha digitável e devolve resultado por arquivo.

## O que faz

- `POST /api/ocr` (admin-only) com `multipart/form-data`.
- Aceita PDF, JPEG, PNG e WebP (até 10 arquivos, 8 MB cada).
- Retorna `{ id, arquivo, linhaDigitavel?, erro? }` por arquivo.

## Relações

- **Usa:** [`../../src/services/ocrService.md`](../../src/services/ocrService.md), [`../../src/services/pdfService.md`](../../src/services/pdfService.md).
- **Usado por:** [`../../src/components/import/OcrUpload.md`](../../src/components/import/OcrUpload.md).

## Notas

- Não grava arquivos; limites de tamanho/tipo são validados server-side.
