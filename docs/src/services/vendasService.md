# `src/services/vendasService.ts`

> Cliente HTTP via `fetch` para o domínio de vendas. Camada de serviço do cliente para comunicar interface com APIs internas (`/api/vendas`, `/api/venda-itens`, `/api/mensais`, `/api/backup`).

## O que faz

- Define interfaces: `DailySale`, `SaleItemData`, `SaleItemInput`, `MonthlySale`.
- Vendas diárias: `registerSale(data, amount, notes?, items?)`, `registerSaleWithCreatedAt` (uso exclusivo na importação XLSX), `fetchDailySales(month, year, filter)`, `updateSale`, `deleteSale`.
- Itens de venda: `fetchSaleItems(saleId)` retorna array vazio se `!response.ok`.
- Mensais: `fetchMonthlyTotal`, `fetchAllMonthly`, `consolidateMonthly`, `isConsolidated`, `autoConsolidate`, `deleteMonthly`.
- Backup: `backupDatabase` (POST `/api/backup`).
- `autoConsolidate()` lê data atual via `getDateArray()` (`utils/date`), decide consolidação do mês anterior (regra: se dia==3 consolida; se já consolidado retorna; se dia>2 consolida) e chama `consolidateMonthly`.

## Relações

- **Usa:** [`src/utils/date.ts`](../utils/date.md) (`getDateArray`), [`/api/vendas`](../pages/api/vendas.md), [`/api/venda-itens`](../pages/api/venda-itens.md), [`/api/mensais`](../pages/api/mensais.md), [`/api/backup`](../pages/api/backup.md)
- **Usado por:** páginas/componentes de vendas (Dashboard, Histórico, Resumo)

## Notas

- `registerSaleWithCreatedAt` aceita `criado_em` opcional para preservar timestamps na importação de planilhas.
- `isConsolidated` lê corpo como texto: retorna `false` se não ok, sem texto ou sem campo `total !== undefined`.
- `autoConsolidate` não faz nada se `getDateArray()` retornar valores inválidos.