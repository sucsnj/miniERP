# `src/services/ocrService.ts`

> Serviço de OCR para extrair linha digitável de boletos a partir de imagem, usando `tesseract.js`.

## O que faz

- Cria worker `eng`, restringe charset a `0123456789. ` e reconhece texto da imagem.
- Normaliza quebras/espaços e tenta duas regex para capturar linha digitável.
- Retorna a linha limpa (sem espaços/pontos) ou `null` em caso de falha.

## Relações

- **Usa:** [`tesseract.js`](https://github.com/naptha/tesseract.js)
- **Usado por:** [`src/services/pdfService.ts`](./pdfService.md)

## Notas

- Pega **sempre a última** ocorrência encontrada (`matches[matches.length - 1]`).
- Regex padrão: `regex1`; fallback: `regex2` (quando chamado com `regexConst='regex2'`).