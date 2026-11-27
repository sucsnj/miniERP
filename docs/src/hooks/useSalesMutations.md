# `src/hooks/useSalesMutations.ts`

> Mutations de vendas com optimistic update no cache do TanStack Query.

## O que faz

- `useCreateSale`: mutation de registro; envia `idempotencyKey` quando fornecida para impedir duplicatas em retries, faz optimistic insert nas listas `sales/daily` da loja atual com `operationId: optimistic-*` e substitui esse marcador pelo ID real devolvido pela API no `onSuccess`. Depois re-consolida automaticamente se o mês da venda já estava consolidado.
- `useUpdateSale`: mutation de edição; atualiza o item no cache (data, valor, notas e `saleType`) e re-consolida o/os meses afetados se já estavam consolidados (meses antigo e novo).
- `useDeleteSale`: mutation de exclusão; remove o item e re-consolida o mês da venda se já estava consolidado.
- Falha em `!response.ok` da API de vendas é propagada como `Error` para permitir rollback.
- `CreateSaleInput` aceita `createdAt` (importações) e `idempotencyKey` (registro normal, UUID); a RPC devolve a venda existente em retry com a mesma chave.
- Snapshots respeitam tenant (`companyId`/`storeId`); nunca vazam para outra empresa/loja.

## Relações

- **Usa:** `useAuth`, `useToast`, `useQueryClient`, `src/services/salesService.ts`, `src/utils/queryKeys.ts`.
- **Usado por:** `src/hooks/useDailySaleForm.ts`, `src/components/sales/EditSaleForm.tsx`, `src/hooks/useSales.ts`.

## Notas

- Antes de re-consolidar, o hook mostra toast informativo de que o mês será re-consolidado.
- Ao concluir, o cache `auto-consolidation:*` é invalidado para evitar stale pós-edição.
- Optimistic ops mantêm a lista visível durante a operação; rollback restaura o snapshot em erro de API.
- O `operationId` no item otimista permanece estável quando a API devolve o ID definitivo, evitando remount/reinício de animações após o sucesso do registro.
- Invalidação é granular por tenant; não recarrega a página inteira.
