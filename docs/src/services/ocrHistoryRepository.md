# `src/services/ocrHistoryRepository.ts`

> Histórico do OCR de boletos armazenado no navegador (IndexedDB).

## O que faz

- `saveOcrHistory(items)`: grava até 60 entradas; apaga expiradas (>5 dias).
- `listOcrHistory()`: lista entradas válidas mais recentes.
- `clearOcrHistory()`: apaga todo o histórico.
- `migrateLegacyOcrHistory()`: migra/descarta dados antigos de `localStorage['ocrRecente']`.

## Relações

- **Usado por:** `src/components/import/OcrUpload.tsx`.

## Notas

- Não armazena arquivos/PDFs ou conteúdo extraível para fora do navegador.
- Entradas expiradas e excedentes são descartadas automaticamente.
