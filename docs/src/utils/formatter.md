# `src/utils/formatter.tsx`

> Formatação e arredondamento de valores monetários.

## O que faz

- `formatCurrency(value, decimals = 0)` formata no padrão `pt-BR` via `Intl.NumberFormat`.
- `formatCurrencyNumber(value, decimals = 0)` arredonda o número para as casas informadas.

## Relações

- **Usado por:** `productPrice` e componentes/páginas (tabelas, gráficos, resumos).
