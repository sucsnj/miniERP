# `src/components/import/OcrUpload.tsx`

> Upload de boletos (PDF/imagem) para OCR e cópia da linha digitável.

## O que faz

- Envia múltiplos arquivos a `POST /api/ocr` (`FormData` campo `files`) e lista `{ arquivo, linhaDigitavel?, erro? }`.
- Clique em um resultado válido copia a linha digitável.
- Histórico armazenado em **IndexedDB** (máx. 60 entradas, 5 dias).

## Relações

- **Usa:** `useToast` (`src/hooks/useToast.ts`), `POST /api/ocr`, `ocrHistoryRepository.ts`.
- **Usado por:** [Agenda](../src/components/payables/Agenda.md) (bloco "Leitura de Contas").

## Notas

- Não usa `localStorage['ocrRecente']`.
- Botão "Limpar histórico" apaga os dados de OCR no navegador.
