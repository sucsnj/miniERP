# `src/hooks/useMonthlyData.ts`

> Hook para concentrar estado de consolidações mensais e ações (carregar/excluir). Exporta `useMonthlyData`.

## O que faz

- Estado `mensais` (`MonthlySale[]`), `initialLoading` e `refreshing`.
- `loadMensais()`: usa `initialLoading` somente na primeira carga; refetches usam `refreshing`.
- `handleDelete(id)`: exclui via `deleteMonthly` e recarrega, com toasts de sucesso/erro.

## Relações

- **Usa:** `fetchAllMonthly`, `deleteMonthly`, `MonthlySale` (`src/services/salesService.ts`).
- **Usado por:** páginas/componentes de consolidações mensais.

## Notas

- Arquivo `useMonthlyData.ts`; identificador exportado é `useMonthlyData`.
- `loadMensais` é estável via `useCallback`; após a primeira carga, refetches mantêm a lista visível.