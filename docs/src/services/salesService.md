# `src/services/salesService.ts`

> Cliente HTTP via `fetch` para o domínio de vendas. Camada de serviço do cliente para comunicar interface com APIs internas (`/api/sales`, `/api/sale-items`, `/api/monthly-sales`, `/api/backup`).

## O que faz

- Define interfaces: `DailySale`, `SaleItemData`, `SaleItemInput`, `MonthlySale`.
- Vendas diárias: `registerSale`, `registerSaleWithCreatedAt`, `fetchDailySales`, `updateSale`, `deleteSale`.
- Itens de venda: `fetchSaleItems`.
- Mensais: `fetchMonthlyTotal`, `fetchAllMonthly`, `consolidateMonthly`, `isConsolidated`, `autoConsolidate`, `deleteMonthly`, além da listagem interna de meses pendentes (`action=missing`).
- `createMissingMonthlyConsolidationMonths()` é chamado por `autoConsolidate` em modo `all-previous`.
- Backup: `backupDatabase` (POST `/api/backup`).
- `isConsolidationChecked` / `markConsolidationChecked` / `invalidateAllConsolidationCache()`: cache de checagem em `localStorage`.
- `isConsolidated` lança erro em `!response.ok`; `false` retornado somente quando não há linha (texto/corpo vazio ou sem `total`).
- `autoConsolidate(storeId?, autoConsolidationDay?, mode?)`: modos `all-previous` e `previous-month`; executa no/após o dia configurado e respeita TTL/cache/settings.

## Relações

- **Usa:** [`src/utils/date.ts`](../utils/date.md) (`getDateArray`), [`src/utils/storage.ts`](../utils/storage.md), [`/api/sales`](../pages/api/sales.md), [`/api/sale-items`](../pages/api/sale-items.md), [`/api/monthly-sales`](../pages/api/monthly-sales.md)
- **Usado por:** páginas/componentes de vendas (Dashboard, Histórico, Resumo)

## Notas

- Registradores/edição/exclusão de vendas falham com `Error` se `!response.ok`.
- `fetchDailySales`, `fetchSaleItems`, `fetchMonthlyTotal` e `registerSaleWithCreatedAt` também lançam erro em `!response.ok`.
- `missing_monthly_consolidation_months` normaliza e retorna `{ month, year }` filtrados por tenant/loja.
