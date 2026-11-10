# `src/pages/index.tsx`

> Dashboard de Vendas (`/`): registra e resume as vendas do mês selecionado.

## O que faz

- Mantém o período (`mes`, `ano`, `anoInput`) e a data selecionada (`selectedDate`) do formulário.
- Carrega as vendas via `useSales(mes, ano, showToast)` sempre que o período muda.
- Calcula `recentSales` (últimas 4 vendas por data e id desc) e orquestra os componentes da tela.
- Permite consolidar o mês (`handleConsolidate`) e fazer backup (`handleBackup`).

## Relações

- **Usa:** `DailySalesTotal`, `DailySaleForm`, `EditSaleForm`, `SalesChart`, `ExportButtons`; hooks `useSales`/`useToast`; utils `date`/`captalize`.
- **Usado por:** rota raiz; consome `./api/vendas.md` e `./api/mensais.md`.

## Notas

- Filtro padrão de `useSales` é `positivas`; `SalesTable` está comentado no JSX.
- Data inicial no fuso `America/Recife`.
