# `src/services/pdfService.ts`

> Extrai linha digitável de boletos em PDF convertendo páginas em imagens, aplicando pré-processamento por regiões/cenários e rodando OCR.

## O que faz

- Converte até 3 páginas do PDF para PNG via `pdf2pic` (densidade 400, 2480x3508).
- Tenta OCR na imagem original; se não achar, aplica 12 cenários de pré-processamento (`sharp`) com redimensionamento, grayscale, threshold, blur, modulate, linear.
- Se ainda não achar, extrai 3 regiões (inferior 30%, intermediária 40-70%, ampla 30-80%) e tenta OCR em cada.
- Em caso de falha total na 1ª tentativa, refaz com `regex2` (`readDigitableLine(...,'regex2')`), define `info=' (ocr inconsistente)'` e retorna linha ou `null`.
- Limpa arquivos temporários via `cleanTemp()` ao encontrar resultado ou ao finalizar tentativas.

## Relações

- **Usa:** [`pdf2pic`](https://github.com/yakovmeister/pdf2pic), [`sharp`](https://sharp.pixelplumbing.com/), [`src/services/ocrService.ts`](./ocrService.md) (`readDigitableLine`), [`src/utils/cleaner.ts`](../utils/cleaner.md) (`cleanTemp`)
- **Usado por:** fluxos de importação/OCR de boletos

## Notas

- Exporta `let info = ""` (estado mutável compartilhado) usado para sinalizar inconsistência do OCR.
- Gera imagens temporárias em `./temp` (conforme `savePath` do `fromPath`).