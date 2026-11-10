# `src/components/payables/PayablesLastTen.tsx`

> Tabela compacta das últimas 10 contas registradas.

## O que faz

- Colunas Vencimento, Distribuidora, Valor e Ações (Ver, Excluir, Editar).
- Exclusão passa por [ConfirmDialog](../common/ConfirmDialog.md); estado vazio tratado.

```ts
interface PayablesLastTenProps {
  latestAccounts: AccountDetails[];
  handleView: (account: AccountDetails) => void;
  handleDelete: (id: number) => void;
  handleEdit: (account: AccountDetails) => void;
}
```

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `AccountDetails`, `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString` (`src/utils/date.ts`), `contas.module.css`.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- O corte de 10 registros vem pronto do pai; aqui só renderiza.
