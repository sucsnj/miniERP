# `src/hooks/usePayables.ts`

> Hook de consulta do módulo de contas a pagar do período atual.

## O que faz

- Expõe `accountsMonth` (contas do mês) e `accountsYear` (contas do ano) via `useQuery`.
- Usa `queryKey` tenant-scoped (`payablesByMonth`/`payablesByYear`) com isolamento por empresa/loja.
- Usa `placeholderData: keepPreviousData` para troca suave de mês/ano; mantém dados antigos visíveis enquanto busca.
- `usePendingTask('payables-initial', ...)` segura o gate da rota na primeira carga das duas queries.
- `loadMonthAccounts()` e `loadYearAccounts()` disparam refetch explícito quando necessário.

## Relações

- **Usa:** `useQuery`, `useAuth`, `fetchAccounts`, `tenantKeys`, `identityFromUser`, `usePendingTask` (`RouteLoadingContext`).
- **Usado por:** `src/pages/payables.tsx`.
