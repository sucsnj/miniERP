# `src/utils/queryPredicates.ts`

> Predicados puros para `queryClient.invalidateQueries`/`getQueriesData`/`setQueryData` em consultas tenant-scoped.

## O que faz

- `isTenantQuery(queryKey, identity)`: confirma segmento base `tenant`, empresa e loja.
- `isTenantDomainQuery(domain)`: factory genérica para domínio raiz (`sales`, `payables`, `invoices`, etc.).
- Atalhos por domínio:
  - `isSalesDailyQuery`, `isMonthlySalesQuery`
  - `isPayablesQuery`, `isPayablesMonthQuery`, `isPayablesYearQuery`
  - `isInvoicesQuery`, `isInvoicesMonthQuery`

## Relações

- **Usa:** `type TenantIdentity` (`src/utils/queryKeys.ts`).
- **Usado por:** mutations/queriesTenant-aware (vendas, payables).

## Notas

- Predicates esperam `queryKey` em `['tenant', companyId, storeId, ...]`.
- Não acessa `Query`; apenas `queryKey`.
