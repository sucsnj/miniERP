# `src/hooks/useSales.ts`

> Hook que concentra estado e ações de vendas diárias do período selecionado. Exporta `useSales`.

## O que faz

- Estado: `sales` (`DailySale[]`), `editingSale` (`DailySale | null`), `initialLoading` (somente primeira carga) e `refreshing` (refetch subsequente).
- Parâmetros: `(month, year, showToast, options?)` com `UseSalesOptions` (`filter?: 'todas'|'positivas'|'negativas'`, `autoConsolidate?: boolean`).
- `loadSales()`: busca via `fetchDailySales(month, year, filter)` e, após revelar a rota, dispara `autoConsolidate()` somente se ativo, o usuário for `admin` e existir `user.storeId`; a chamada não bloqueia o estado inicial.
- Ações: `handleConsolidate()` (consolida mês), `handleBackup()` (executa backup e exibe mensagem), `handleEditSale(sale)`, `handleCancelEdit()`, `handleSaved()` (fecha edição e recarrega), `handleDeleteSale(id)` (verifica existência e regra `canEdit(sale.data)`; exibe toasts apropriados).

## Relações

- **Usa:** `fetchDailySales`, `consolidateMonthly`, `backupDatabase`, `deleteSale`, `autoConsolidate`, `DailySale` (`src/services/salesService.ts`), `canEdit` (`src/utils/edit.ts`), `useAuth` (`src/contexts/AuthContext.tsx`).
- **Usado por:** páginas/componentes relacionados a vendas diárias.

## Notas

- Arquivo `useSales.ts`; identificador exportado é `useSales`.
- `autoConsolidate` é chamado após carregar quando `autoConsolidateEnabled` for true, apenas para admin.
- Após a primeira carga, `refreshing` é usado para ações/reloads; o conteúdo existente permanece visível.