# `src/components/payables/PayablesLastTen.tsx`

> Tabela compacta das últimas 10 contas registradas.

## O que faz

- Colunas Vencimento, Distribuidora e Valor; a linha inteira é clicável/accessível por teclado (`Enter`/`Espaço`), abrindo os detalhes.
- Coluna Ações mantém apenas "Excluir" (via [ConfirmDialog](../common/ConfirmDialog.md)).
- Estado vazio tratado.

```ts
interface PayablesLastTenProps {
  latestAccounts: AccountDetails[];
  handleView: (account: AccountDetails) => void;
  handleDelete: (id: string) => void;
}
```

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `AccountDetails`, `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString` (`src/utils/date.ts`), `payables.module.css`.
- **Usado por:** [`../pages/payables.md`](../../pages/payables.md).

## Notas

- O corte de 10 registros vem pronto do pai; aqui só renderiza.
