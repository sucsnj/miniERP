# `src/components/pix/PixModal.tsx`

> Modal com QR Code PIX para pagamento (Copiar, Baixar PNG, Registrar venda).

## O que faz

- Renderiza o QR em `<canvas>` (`renderQr`) e o pulsa ao abrir; exibe nome, banco, valor (ou "Aberto") e chave.
- Ações: copiar payload, baixar PNG e registrar a venda com `saleType = 'pix'`; ESC/overlay fecham.

```ts
interface PixModalProps {
  isOpen: boolean; onClose: () => void;
  payload: string; merchantName: string; merchantBank: string;
  amount: string | null; pixKey: string;
  onRegister?: () => void | Promise<void>;
}
```

## Relações

- **Usa:** `renderQr`/`pulseQr`/`QR_SIZE` (`src/utils/qrPix.ts`), `downloadQrPng` (`src/utils/pixActions.ts`), `showToast` (`src/utils/toast.ts`), `copyToClipboard` (`src/utils/clipboard.ts`), `useFocusTrap`.
- **Usado por:** [DailySaleForm](../sales/DailySaleForm.md).

## Notas

- `createPortal` no `document.body`; retorna `null` se fechado ou em SSR.
- A opção de impressão foi removida; `Registrar` executa o fluxo padrão de registro e fecha o modal.
- Os utilitários PIX sem JSX vivem em `src/utils/` (`pix.ts`, `qrPix.ts`, `pixActions.ts`).
