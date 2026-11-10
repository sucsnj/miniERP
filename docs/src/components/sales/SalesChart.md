# `src/components/sales/SalesChart.tsx`

> Gráfico de evolução diária das vendas (linha ou barras) com `recharts`.

## O que faz

- Ordena por `id` e exibe os últimos 3/7/30 registros; alterna entre `LineChart` e `BarChart`.
- Tooltip formata valores com `formatCurrency`; eixo X usa `criado_em`.

```ts
interface SalesChartProps { data: DailySale[]; }
```

## Relações

- **Usa:** `recharts`, `DailySale` (`src/services/vendasService.ts`), `formatCurrency`/`formatCurrencyNumber` (`src/utils/formatter.tsx`).
- **Usado por:** `../../pages/index.md`.

## Notas

- Estado local apenas para o tipo de gráfico e o alcance (`range`).
