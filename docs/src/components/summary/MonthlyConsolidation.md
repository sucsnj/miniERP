# `src/components/summary/MonthlyConsolidation.tsx`

> Tabela de consolidação mensal (pago x pendente).

## O que faz

- Renderiza os 12 meses com valor pago e pendente formatados.
- Usa `capitalize(formatMonthName(mes))` no rótulo do mês.

```ts
interface MonthlyConsolidationProps {
  months: { month: number; paid: number; pending: number }[];
}
```

## Relações

- **Usa:** `formatCurrency` (`src/utils/formatter.tsx`), `formatMonthName` (`src/utils/date.ts`), `capitalize` (`src/utils/captalize.tsx`).
- **Usado por:** [Summary](./Summary.md).

## Notas

- Apresentacional; os dados vêm prontos do [Summary](./Summary.md).
