# `src/hooks/useSalesMutations.ts`

> Mutations de vendas com optimistic update no cache do TanStack Query.

## O que faz

- `useCreateSale`: mutation de registro; faz optimistic insert nas listas `sales/daily` da loja atual e re-consolida automaticamente se o mês da venda já estava consolidado.
- `useUpdateSale`: mutation de edição; atualiza o item no cache e re-consolida o/os meses afetados se já estavam consolidados (meses antigo e novo).
- `useDeleteSale`: mutation de exclusão; remove o item e re-consolida o mês da venda se já estava consolidado.
- Falha em `!response.ok` da API de vendas é propagada como `Error` para permitir rollback.
- Snapshots respeitam tenant (`companyId`/`storeId`); nunca vazam para outra empresa/loja.

## Relações

- **Usa:** `useAuth`, `useToast`, `useQueryClient`, `src/services/salesService.ts`, `src/utils/queryKeys.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts`, `src/components/sales/EditSaleForm.tsx`, `src/hooks/useSales.ts`.

## Notas

- Antes de re-consolidar, o hook mostra toast informativo de que o mês será re-consolidado.
- Ao concluir, o cache `auto-consolidation:*` é invalidado para evitar stale pós-edição.
- Optimistic ops mantêm a lista visível durante a operação; rollback restaura o snapshot em erro de API.
- Invalidação é granular por tenant; não recarrega a página inteira.
