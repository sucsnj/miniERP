# `src/pages/index.tsx`

> Dashboard de Vendas (`/`): registra e resume as vendas do mês selecionado.

## O que faz

- Usa o período atual (`month`, `year`) e mantém a data selecionada (`selectedDate`) do formulário.
- Carrega as vendas via `useSales(month, year, showToast)`.
- Calcula `recentSales` (últimas 4 vendas por data e id desc) e orquestra os componentes da tela.

## Relações

- **Usa:** `DailySalesTotal`, `DailySaleForm`, `EditSaleForm`; hooks `useSales`/`useToast`; utils `date`.
- **Usado por:** rota raiz; consome `./api/vendas.md` e `./api/mensais.md`.

## Notas

- Filtro padrão de `useSales` é `positivas`; `SalesTable` está comentado no JSX.
- Data inicial no fuso `America/Recife`.
