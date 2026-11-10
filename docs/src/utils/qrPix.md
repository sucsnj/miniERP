# `src/utils/qrPix.ts`

> Renderização do QR Code (biblioteca `qrcode`) e exportação em PNG.

## O que faz

- `renderQr(canvas, payload, size?)` desenha o QR no canvas (`QR_SIZE = 280`).
- `generateHighResPng(payload, scale = 12)` devolve um Data URL PNG de alta resolução.
- `pulseQr(target)` reinicia a animação CSS de entrada do QR.

## Relações

- **Usa:** `qrcode`.
- **Usado por:** `PixModal` e `pixActions` (`./pixActions.md`).
