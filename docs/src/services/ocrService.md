# `src/services/ocrService.ts`

> Serviço de OCR para extrair linha digitável de boletos a partir de imagem.

## O que faz

- `readDigitableLine(source: Buffer)`: cria worker Tesseract e tenta múltiplos pré-processamentos (`sharp`).
- Restringe whitelist a dígitos, espaço e `.`; reduz ruído em imagens reais.
- Normaliza candidatos plausíveis em texto OCR; não exige checksum por tolerar boletos de baixa qualidade.

## Relações

- **Usa:** `tesseract.js`, `sharp`, `src/services/boletoBarcode.ts`.
- **Usado por:** [`src/services/pdfService.ts`](./pdfService.md) e [`src/pages/api/ocr.ts`](../pages/api/ocr.md).

## Notas

- Apenas candidatos plausíveis retornam; o serviço não preenche formulários.
