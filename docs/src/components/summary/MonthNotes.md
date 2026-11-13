# `src/components/summary/MonthNotes.tsx`

> Painel de notas fiscais do mês, com seleção de período e exclusão.

## O que faz

- Busca as notas com `useQuery` (`staleTime=0`, refetch em mount/focus/reconnect) e soma os valores.
- Seletores de mês (12) e ano (últimos 5); tabela Emissão/Distribuidora/Valor/Ações.
- Excluir passa pelo [ConfirmDialog](../common/ConfirmDialog.md) e usa `useDeleteInvoice` (optimistic update, rollback, invalidação granular).

```ts
interface MonthNotesProps {
  year: number; month: number;
  setYear: (year: number) => void; setMonth: (month: number) => void;
}
```

## Relações

- **Usa:** React Query, `fetchInvoicesByPeriod`/`InvoiceDetails` (`src/services/invoicesService.ts`), `useDeleteInvoice` (`src/hooks/usePayablesMutations.ts`), [ConfirmDialog](../common/ConfirmDialog.md), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString`/`getCurrentYear` (`src/utils/date.ts`).
- **Usado por:** [Summary](./Summary.md).

## Notas

- `useDeleteInvoice` atualiza todas as invoices do mês em cache (optimistic update) e invalida `invoices/month` do tenant.
