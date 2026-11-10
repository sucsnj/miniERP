# `src/utils/clipboard.ts`

> Cópia de texto para a área de transferência, com fallback para contexto não seguro.

## O que faz

- `copyToClipboard(text, onSuccess?, onError?)` usa `navigator.clipboard` quando disponível e em contexto seguro.
- Fallback via `textarea` + `document.execCommand('copy')`.
- Erros são entregues ao callback `onError` (não lança exceção).

## Relações

- **Usado por:** `PixModal` (copiar o "PIX Copia e Cola").
