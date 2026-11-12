# `src/pages/products.tsx`

> Listagem de produtos e serviços (`/products`) com filtros, busca, paginação e controle de status.

## O que faz

- Carrega o catálogo mesclado via TanStack Query (`useProductsCatalog`), com paginação local (10/página).
- Carrega auxiliares de filtros via `useProductsOptions`.
- Busca/filtros por texto, tipo, categoria, marca, fornecedor e status são chaveados por tenant no cache (`/products/catalog`).
- Alterna status de produtos e exclui itens via mutations (`useProductMutations`), com optimistic update (toggle) e invalidação.
- Navega para `/registration?id=X` ao editar; FAB "+" leva a `/registration`.

## Relações

- **Usa:** `useProductsCatalog`, `useProductsOptions`, `useProductMutations` (`src/hooks/useProducts.ts`), componentes `ProductList`, `ProductFilters`, `ProductDeleteModal`.
- **Usado por:** consome `./api/products.md` e `./api/products/services.md`.

## Notas

- Serviços não têm marca/fornecedor/estoque: usam defaults (`marca_id: 1`, `fornecedor_id: 1`, `unidade_medida_id: 21`).
- Paginação ocorre no cliente; `toggleStatus` só se aplica a produtos.
- O catálogo grosseiro mantém `staleTime` padrão do cliente e `keepPreviousData` em refetch.
