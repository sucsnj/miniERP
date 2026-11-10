# `src/components/sales/SalesTable.tsx`

> Tabela de vendas diárias com edição, exclusão e limite de linhas configurável.

## O que faz

- Ordena por data e `id` desc; exibe Criado em, Data, Valor, Observações (tooltip) e Ações.
- Limite de linhas (5/25/50/100/Todas) persistido em `localStorage['maxSales']`.
- Excluir abre o [ConfirmDialog](../common/ConfirmDialog.md); ações só quando `canEdit(data)`.

```ts
interface SalesTableProps {
  sales: DailySale[];
  onEditSale?: (sale: DailySale) => void;
  onDeleteSale?: (id: number) => void;
}
```

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `formatCurrency`/`formatDateString`/`toTimestamp` (`src/utils/`), `canEdit` (`src/utils/edit.ts`), `contas.module.css`.
- **Usado por:** `../../pages/historico.md`; no dashboard o uso está comentado.

## Notas

- O total aparece no título; o corte é feito com `slice(0, maxSales)`.
