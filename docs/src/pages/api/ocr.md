# `src/pages/api/ocr.ts`

> OCR de boletos: recebe PDFs/imagens, lê a linha digitável e devolve um resultado por arquivo.

## O que faz

- `POST /api/ocr` (admin-only) com `multipart/form-data`, campo `files` (até 10, até 8 MB por arquivo).
- Tipos aceitos: PDF, PNG, JPEG, WebP.
- Detecta magic bytes/MIME; rejeita arquivo inválido sem processá-lo.
- Retorna um array `{ id, arquivo, linhaDigitavel?, erro? }`; um arquivo inválido não interrompe o lote.

## Relações

- **Usa:** [`../../services/ocrService.md`](../../services/ocrService.md), [`../../services/pdfService.md`](../../services/pdfService.md), `multer`.
- **Usado por:** [`../../components/import/OcrUpload.md`](../../components/import/OcrUpload.md).

## Notas

- Não grava arquivos no servidor; uploads entram na memória (`multer.memoryStorage()`).
- O PDF é limitado a 2 páginas.
