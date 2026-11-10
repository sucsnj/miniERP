# `src/components/SalesChart.tsx`

## Descrição

Componente de visualização de gráfico de vendas usando `recharts`.

## Contexto

É usado em Vendas Diárias com a finalidade de exibir um gráfico de linha ou barras das vendas diárias, permitindo uma visão panorâmica da evolução das vendas.

## Responsabilidades

- Exibir gráfico de linha ou barras.
- Permitir seleção de período de exibição (30, 7 ou 3 últimos registros).
- Exibir tooltip formatado.

## Props

- `data` - array de vendas diárias.

## Dependências

- `LineChart`
- `BarChart`
- `XAxis`
- `YAxis`
- `CartesianGrid`
- `Tooltip`
- `ResponsiveContainer`
- `VendaDiaria`

## Observações

- Os dados são ordenados e normalizados antes da renderização.
- O gráfico alterna entre `LineChart` e `BarChart`.
