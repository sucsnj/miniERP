# `src/components/common/ConfirmDialog.tsx`

> Diálogo de confirmação para ações sensíveis (exclusões).

## O que faz

- Exibe título/mensagem e botões confirmar/cancelar; renderiza via `createPortal` no `document.body`.
- ESC e clique no backdrop fecham; sem `onCancel`, o fechamento chama `onConfirm`.
- Mantém o foco no diálogo (`useFocusTrap`) e usa `confirmDialog.module.css`.
- `danger` aplica o visual de exclusão; IDs dos botões são opcionais para preservar contratos de tela.

```ts
interface ConfirmDialogProps {
  open: boolean; title: string; message: React.ReactNode;
  confirmText?: string; cancelText?: string; danger?: boolean;
  confirmButtonId?: string; cancelButtonId?: string;
  onConfirm: () => void; onCancel?: () => void;
}
```

## Relações

- **Usa:** `useShortcuts` (`src/utils/shortcuts.tsx`), `useFocusTrap` (`src/utils/focus.tsx`), `confirmDialog.module.css`.
- **Usado por:** [ProductDeleteModal](../products/ProductDeleteModal.md), [CatalogEntityModal](../catalog/CatalogEntityModal.md), [PayablesFilterPanel](../payables/PayablesFilterPanel.md), [PayablesLastTen](../payables/PayablesLastTen.md), [SalesTable](../sales/SalesTable.md), [MonthNotes](../summary/MonthNotes.md).

## Notas

- Acessibilidade com `role="dialog"`, `aria-modal` e `aria-labelledby`/`aria-describedby`.
- O backdrop fica em `calc(var(--z-modal) + 1)` para sobrepor modais abertos.
