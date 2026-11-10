# `src/components/import/OcrUpload.tsx`

> Upload de boletos (PDF/imagem) para OCR, com cópia da linha digitável.

## O que faz

- Envia múltiplos arquivos a `POST /api/ocr` (`FormData` campo `files`) e lista `{ arquivo, linha?, erro? }`.
- Clicar em um resultado copia a linha digitável; dispara toasts de carregamento/sucesso/erro.

## Relações

- **Usa:** `useToast` (`src/hooks/useToast.ts`), `POST /api/ocr`.
- **Usado por:** [Agenda](../payables/Agenda.md) (bloco "Leitura de Contas").

## Notas

- Persiste o último resultado em `localStorage['ocrRecente']` e o recarrega ao montar.
- Sem props; o payload do OCR tem tipagem local simples (`OcrResult[]`).
