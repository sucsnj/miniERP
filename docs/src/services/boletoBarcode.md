# `src/services/boletoBarcode.ts`

> Normalização e extração de linha digitável de boletos.

## O que faz

- `normalizeDigitableLine(value)` (47/48 dígitos) e `extractDigitableLineFromText(value)`.
- Ao extrair de OCR, aceita a sequência 47/48 pelo formato da linha bancária; a leitura é manual/copy-to-use, não usada para transações.

## Relações

- **Usa:** `src/services/ocrService.ts`, `src/services/pdfService.ts`
- **Usado por:** pipeline de OCR de boletos.

## Notas

- Boletos bancários são normalizados para 47 dígitos; arrecadação (`8...`) para 48 dígitos.
- Não validamos checksum porque muitos PDFs/baixas qualidades trazem falsos erros de OCR.
