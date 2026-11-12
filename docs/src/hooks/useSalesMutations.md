# `src/hooks/useSalesMutations.ts`

> Mutations de vendas com optimistic update no cache do TanStack Query.

## O que faz

- `useCreateSale`: mutation de registro; faz optimistic insert apenas nas listas `sales/daily` da loja atual no mês/ano correto e no filtro compatível; invalida vendas/mensais/itens ao finalizar.
- `useUpdateSale`: mutation de edição; atualiza os campos `date/amount/notes` no cache das listas da loja atual; invalida vendas/mensais/itens ao finalizar.
- `useDeleteSale`: mutation de exclusão; remove a venda das listas da loja atual e invalida vendas/mensais/itens ao finalizar.
- Falha em `!response.ok` das APIs de vendas é propagada como `Error` para permitir rollback/rollback completo.
- Snapshots respeitam tenant (`companyId`/`storeId`); nunca vazam para outra empresa/loja.

## Relações

- **Usa:** `useAuth`, `useQueryClient`, `src/services/salesService.ts`, `src/utils/queryKeys.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts`, `src/components/sales/EditSaleForm.tsx`, `src/hooks/useSales.ts`.

## Notas

- Optimistic ops mantêm a lista visível durante a operação; rollback restaura o snapshot em erro de API.
- Invalidação é granular por tenant; não recarrega a página inteira.
