# `src/hooks/useMonthlyData.ts`

> Hook para concentrar estado de consolidações mensais e ações (carregar/excluir). Exporta `useMonthlyData`.

## O que faz

- Estado `mensais` (`MonthlySale[]`).
- `loadMensais()`: busca todas via `fetchAllMonthly` (estável via `useCallback`).
- `handleDelete(id)`: exclui via `deleteMonthly` e recarrega, com toasts de sucesso/erro.

## Relações

- **Usa:** `fetchAllMonthly`, `deleteMonthly`, `MonthlySale` (`src/services/vendasService.ts`).
- **Usado por:** páginas/componentes de consolidações mensais.

## Notas

- Arquivo `useMonthlyData.ts`; identificador exportado é `useMonthlyData`.
- Callback `loadMensais` depende de `showToast`? Não — `handleDelete` usa `showToast`; `loadMensais` não. Mantido estável conforme código.