# `src/components/payables/PayablesPaymentModal.tsx`

> Modal para editar observações e confirmar pagamento de uma conta.

## O que faz

- Recebe `account` e `notes` editáveis; mostra textarea para Banco/Observações.
- Rodapé com "Cancelar" e "Confirmar pagamento".
- Foca automaticamente na textarea ao abrir.

```ts
interface PaymentModalProps {
  account: AccountDetails | null;
  isOpen: boolean;
  notes: string;
  setNotes: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}
```

## Relações

- **Usa:** [AppModalShell](../common/AppModalShell.md), `payables.module.css`, `AccountDetails`.
- **Usado por:** [Payables](../../pages/payables.md).

## Notas

- O pai salva as observações via `useUpdateAccount` antes de chamar `usePayAccount`.
- O pai também limpa `selectedAccount` no cancelar/confirmar; cancelar não reabre o modal de detalhes/edição.
