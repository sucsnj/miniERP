# `src/components/import/OcrUpload.tsx`

> Upload de boletos (PDF/imagem) para OCR e cópia da linha digitável.

## O que faz

- Múltiplos arquivos aceitos (PDF, PNG, JPEG, WebP); cada arquivo limitado a 4 MB no cliente (compatível com o limite de 4,5 MB de Vercel Functions) e até 10 arquivos.
- Envia para `POST /api/ocr` um arquivo por vez, sequencialmente; agrega os resultados sem estourar o payload de uma única request.
- Antes de fazer `JSON.parse`, valida o `Content-Type`; 413/resposta não JSON gera uma mensagem para o arquivo em vez de quebrar a UI.
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
