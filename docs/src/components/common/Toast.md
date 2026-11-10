# `src/components/common/Toast.tsx`

> Notificação flutuante apresentacional (mensagem + tipo + auto-close).

## O que faz

- Renderiza por `position`, colore por `type` (`info`/`success`/`error`) e fecha sozinho após `duration`.
- `duration = null` desativa o auto-close; `open = false` não renderiza.

```ts
type ToastType = 'success' | 'error' | 'info';
type ToastPosition = 'top-right' | 'bottom-right' | 'top-left'
  | 'top-center' | 'local-top-right' | 'local-top-left';

interface ToastProps {
  open: boolean; message: string; type?: ToastType;
  onClose: () => void; position?: ToastPosition;
  duration?: number | null; // default 3000
}
```

## Relações

- **Usa:** `useEffect` (timer) e `toast.module.css`.
- **Usado por:** [Toaster](./Toaster.md) e diretamente por `OcrUpload`.

## Notas

- Posições `local-*` usam `position: absolute` (relativas a um container); as demais, `fixed`.
- O host global (store + `useToast`) é o [Toaster](./Toaster.md) e `src/utils/toast.ts`.
