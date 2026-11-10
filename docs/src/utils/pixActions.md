# `src/utils/pixActions.ts`

> Ações do painel PIX: baixar o PNG do QR Code e imprimir a folha.

## O que faz

- `downloadQrPng(payload)` gera PNG de alta resolução e dispara o download.
- `printPixSheet(data)` preenche a folha (`print-*`) e chama `window.print()`.
- `PrintSheetData` descreve os dados impressos (`payload`, `name`, `bank`, `amount`, `key`).

## Relações

- **Usa:** `qrcode`, `generateHighResPng` (`./qrPix.md`) e `downloadDataUrl` (`./download.md`).
- **Usado por:** `PixModal`.
