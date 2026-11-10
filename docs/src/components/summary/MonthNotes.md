# `src/components/summary/MonthNotes.tsx`

> Painel de notas fiscais do mês, com seleção de período e exclusão.

## O que faz

- Busca as notas com `useQuery(['notas', ano, mes])` e soma os valores.
- Seletores de mês (12) e ano (últimos 5); tabela Emissão/Distribuidora/Valor/Ações.
- Excluir passa pelo [ConfirmDialog](../common/ConfirmDialog.md) e invalida a query.

```ts
interface MonthNotesProps {
  year: number; month: number;
  setYear: (year: number) => void; setMonth: (month: number) => void;
}
```

## Relações

- **Usa:** React Query, `fetchInvoicesByPeriod`/`deleteInvoice`/`InvoiceDetails` (`src/services/notasService.ts`), [ConfirmDialog](../common/ConfirmDialog.md), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString`/`getCurrentYear` (`src/utils/date.ts`).
- **Usado por:** [Summary](./Summary.md).

## Notas

- `queryFn` normaliza a resposta para array (`Array.isArray(data) ? data : [data]`).
