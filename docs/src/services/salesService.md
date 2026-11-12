# `src/services/salesService.ts`

> Cliente HTTP via `fetch` para o domínio de vendas. Camada de serviço do cliente para comunicar interface com APIs internas (`/api/vendas`, `/api/venda-itens`, `/api/mensais`, `/api/backup`).

## O que faz

- Define interfaces: `DailySale`, `SaleItemData`, `SaleItemInput`, `MonthlySale`.
- Vendas diárias: `registerSale(data, amount, notes?, items?)`, `registerSaleWithCreatedAt` (uso exclusivo na importação XLSX), `fetchDailySales(month, year, filter)`, `updateSale`, `deleteSale`.
- Itens de venda: `fetchSaleItems(saleId)` retorna array vazio se `!response.ok`.
- Mensais: `fetchMonthlyTotal`, `fetchAllMonthly`, `consolidateMonthly`, `isConsolidated`, `autoConsolidate`, `deleteMonthly`.
- Backup: `backupDatabase` (POST `/api/backup`).
- `isConsolidationChecked` / `markConsolidationChecked` / `invalidateConsolidationCache` / `invalidateAllConsolidationCache`: cache de checagem em `localStorage` (`auto-consolidation:v1:<storeId>:<year>-<month>`), TTL de 1 hora.
- `consolidateMonthly(month, year, storeId?)`: falha com erro em `!response.ok`; quando `storeId` é informado, marca a checagem.
- `autoConsolidate(storeId?, consolidationDay?)`: roda apenas no/após o dia configurado (`1-28`) e com `storeId` informado; respeita cache e consolida o mês anterior no máximo uma vez por loja por TTL.

## Relações

- **Usa:** [`src/utils/date.ts`](../utils/date.md) (`getDateArray`), [`src/utils/storage.ts`](../utils/storage.md) (`readStoredString`/`writeStoredValue`/`removeStoredValue`), [`/api/vendas`](../pages/api/sales.md), [`/api/venda-itens`](../pages/api/sale-items.md), [`/api/mensais`](../pages/api/monthly-sales.md)
- **Usado por:** páginas/componentes de vendas (Dashboard, Histórico, Resumo)

## Notas

- Registradores/edição/exclusão de vendas falham com `Error` se `!response.ok` (propagado pelas mutations).
- `registerSaleWithCreatedAt` aceita `criado_em` opcional para preservar timestamps na importação de planilhas.
- `isConsolidated` lê corpo como texto: retorna `false` se não ok, sem texto ou sem campo `total !== undefined`.
- `autoConsolidate` é disparado após a primeira carga de vendas pelo `useSales` sem bloquear a rota; usa `storeId` atual via `useAuth`; respeita cache, `autoConsolidationEnabled` e `autoConsolidationDay` (empresa) e não faz nada antes do dia configurado.