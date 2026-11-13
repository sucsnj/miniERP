# `src/pages/index.tsx`

> Dashboard de Vendas (`/`): registra e resume as vendas do mês selecionado.

## O que faz

- O período é derivado da data selecionada no formulário (`selectedDate`) e usado em `useSales(month, year, showToast)`.
- Ao alterar a data, "Resumo do dia" e "Total do Período" passam a refletir o mês/ano correspondente.
- Calcula `recentSales` (últimas 4 vendas por data e id desc) e orquestra os componentes da tela.

## Relações

- **Usa:** `DailySalesTotal`, `DailySaleForm`, `EditSaleForm`; hooks `useSales`/`useToast`; utils `date`.
- **Usado por:** rota raiz; consome `./api/vendas.md` e `./api/mensais.md`.

## Notas

- Filtro padrão de `useSales` é `positivas`; `SalesTable` está comentado no JSX.
- Data inicial no fuso `America/Recife`.
