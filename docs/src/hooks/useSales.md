# `src/hooks/useSales.ts`

> Hook que concentra estado e ações de vendas diárias do período selecionado. Exporta `useSales`.

## O que faz

- Consulta `sales` com `useQuery` (staleTime: 5 min; refetch on window focus/reconnect para vendas), com `queryKey` tenant-scoped pelo período/filtro.
- Estado: `sales` (`DailySale[]`), `editingSale` (`DailySale | null`), `initialLoading` (primeiro fetch para o gate) e `refreshing` (isFetching posterior).
- Parâmetros: `(month, year, showToast, options?)` com `UseSalesOptions` (`filter?: 'todas'|'positivas'|'negativas'`, `autoConsolidate?: boolean`).
- `loadSales()` dispara `refetch()`; `autoConsolidate()` roda em background fora do bloqueio da rota (somente admin com `storeId`, `autoConsolidate` ativo e auto consolidação habilitada nas configurações, no dia configurado).
- Ações: `handleConsolidate()`, `handleEditSale(sale)`, `handleCancelEdit()`, `handleSaved()` e `handleDeleteSale(id)`.

## Relações

- **Usa:** `useQuery` (`@tanstack/react-query`), `tenantKeys`/`identityFromUser` (`src/utils/queryKeys.ts`), `usePendingTask` (`src/contexts/RouteLoadingContext.tsx`), `fetchDailySales`, `consolidateMonthly`, `autoConsolidate`, `DailySale` (`src/services/salesService.ts`), `canEdit`, `useAuth`, `useSettings`, `useDeleteSale` (`src/hooks/useSalesMutations.ts`).
- **Usado por:** páginas/componentes relacionados a vendas diárias.

## Notas

- Arquivo `useSales.ts`; identificador exportado é `useSales`.
- Após a primeira carga, ações/refetch usam `refreshing` e não reabrem o skeleton da rota.