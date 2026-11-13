# `src/components/import/OcrUpload.tsx`

> Upload de boletos (PDF/imagem) para OCR e cópia da linha digitável.

## O que faz

- Múltiplos arquivos aceitos (PDF, PNG, JPEG, WebP) até o limite definido no endpoint.
- Envia para `POST /api/ocr`; resultado por arquivo mostra linha ou erro.
- Histórico armazenado em **IndexedDB** (máx. 60 itens e 5 dias).
- Botão "Limpar histórico" apaga o histórico local.
- Clique em um sucesso copia a linha digitável.

## Relações

- **Usa:** `useToast` (`src/hooks/useToast.ts`), `ocrHistoryRepository.ts`.
- **Usado por:** [Agenda](../payables/Agenda.md) (bloco "Leitura de Contas").

## Notas

- Não usa `localStorage['ocrRecente']`.
- Resultados persistentes são locais ao navegador/dispositivo.
- Não preenche nenhum formulário automaticamente.
