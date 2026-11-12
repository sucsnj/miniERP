# `src/hooks/useMonthlyData.ts`

> Hook para consolidações mensais com TanStack Query (`useQuery`/`useMutation`). Exporta `useMonthlyData`.

## O que faz

- `mensais` (`MonthlySale[]`): lista otimista com rollback em falha de exclusão.
- `initialLoading`: gate da rota apenas na primeira carga.
- `refreshing`: `isFetching` para refletir revalidações.
- `handleDelete(id)`: mutation com `onMutate` removendo item, `onError` restaurando snapshot e `onSettled` invalidando a lista.
- `handleConsolidate(month, year)`: mutation que chama `consolidateMonthly` e invalida a lista otimista (com toast).

## Relações

- **Usa:** `fetchAllMonthly`, `deleteMonthly`, `consolidateMonthly`, `MonthlySale` (`src/services/salesService.ts`), `useAuth`, `tenantKeys`.
- **Usado por:** `src/pages/summary.tsx`.

## Notas

- A lista é tenant-scoped (`tenantKeys.monthlySalesAll`).
- Toda resposta de serviço (`fetchAllMonthly`, `deleteMonthly`) lança `Error` em `!response.ok`.
