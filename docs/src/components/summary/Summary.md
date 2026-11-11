# `src/components/summary/Summary.tsx`

> Painel de resumo financeiro de contas a pagar.

## O que faz

- Calcula totais pago/pendente/anual e contadores (pago/pendente/total) em `useMemo`.
- Gera os totais por distribuidora (pendentes) e a consolidação dos 12 meses.
- Renderiza [TotalsByDistributor](./TotalsByDistributor.md), [MonthlyConsolidation](./MonthlyConsolidation.md) e [MonthNotes](./MonthNotes.md).

```ts
interface SummaryProps {
  accountsYear: AccountDetails[]; year: number; month: number;
  setYear: (year: number) => void; setMonth: (month: number) => void;
}
```

## Relações

- **Usa:** `AccountDetails` (`src/services/payablesService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `parseDate` (`src/utils/date.ts`), `payables.module.css`.
- **Usado por:** `../../pages/payables.md`.

## Notas

- A consolidação por mês usa `parseDate` sobre o `vencimento`.
