# `src/utils/pixActions.ts`

> Ações do painel PIX: baixar o PNG do QR Code.

## O que faz

- `downloadQrPng(payload)` gera PNG de alta resolução e dispara o download.

## Relações

- **Usa:** `generateHighResPng` (`./qrPix.md`) e `downloadDataUrl` (`./download.md`).
- **Usado por:** [pixModal](../components/pix/PixModal.md).
