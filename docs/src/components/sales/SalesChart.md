# `src/components/sales/SalesChart.tsx`

> Gráfico de evolução diária das vendas (linha ou barras) com `recharts`.

## O que faz

- Ordena por `createdAt` e exibe os últimos 3/7/30 registros; alterna entre `LineChart` e `BarChart`.
- Tooltip formata valores com `formatCurrency`; eixo X usa `date` e a série usa `amount`.

```ts
interface SalesChartProps { data: DailySale[]; }
```

## Relações

- **Usa:** `recharts`, `DailySale` (`src/services/salesService.ts`), `formatCurrency`/`formatCurrencyNumber` (`src/utils/formatter.tsx`).
- **Usado por:** `../../pages/index.md`.

## Notas

- Estado local apenas para o tipo de gráfico e o alcance (`range`).
