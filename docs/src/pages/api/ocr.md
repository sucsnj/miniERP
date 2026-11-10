# `src/pages/api/ocr.ts`

> OCR de boletos: recebe PDFs/imagens, lê a linha digitável e devolve os resultados por arquivo.

## O que faz

- Só aceita `POST` multipart, campo `files` (um ou mais); `bodyParser` desligado, upload via `multer`.
- Encaminha `.pdf` para `readPdfWithOcr` e as demais extensões para `readDigitableLine`.
- Responde `200` com `[{ arquivo, linha }]` ou `[{ arquivo, erro }]`; `400` sem arquivos; `405` fora de POST.
- Remove cada arquivo de upload no `finally`.

## Relações

- **Usa:** `src/services/ocrService.ts`, `src/services/pdfService.ts`; `multer`.
- **Usado por:** `src/components/import/OcrUpload.tsx`.

## Notas

- A flag `info` (de `pdfService`) sufixa o nome quando a leitura só veio por `regex2` (OCR inconsistente).
- Arquivos temporários ficam em `./temp` (limpos por `cleanTemp()`).
