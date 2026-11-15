# `src/components/payables/PayablesAccountModal.tsx`

> Modal "Nova Conta" para criar uma conta a pagar.

## O que faz

- Campos renderizados em linha, com o nome do campo à esquerda e o input à direita (`AccountField`).
- Rodapé fixo: "Limpar Campos", Cancelar e "Registrar Conta" (submit ligado ao formulário por `useId`/`form={formId}`).
- Auto-foca Distribuidora ao abrir; sempre cria uma nova conta (edição é inline nos detalhes).

```ts
interface PayablesAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: string;
  amount: string;
  dueDate: string;
  document: string;
  bankNotes: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onReset: () => void;
}
```

## Relações

- **Usa:** [AppModalShell](../common/AppModalShell.md), `Form`, [AccountField](./AccountField.md), `payables.module.css`.
- **Usado por:** [Payables](../../pages/payables.md).

## Notas

- A aparência segue o padrão dos modais de carrinho e PIX; campos continuam acessíveis apenas para admin no pai.
- O modal não edita contas existentes; use o modal de detalhes para edição inline.
