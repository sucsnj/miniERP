# `src/hooks/useProducts.ts`

> Hook para catálogo/auxiliares e mutations do módulo de produtos. Exporta `useProductsCatalog`, `useProductsOptions` e `useProductMutations`.

## O que faz

- `useProductsCatalog(filters)`: consulta `products` + `services`, unifica ordenando por nome e cacheia por filtro/tenant (`products/catalog`).
- `useProductsOptions()`: carrega categorias, marcas, fornecedores e unidades de medida (cache/stale time maior).
- `useProductMutations()`: `toggleStatus` com optimistic update no cache do catálogo; `remove` por kind (`SERVICE` → `/api/products/services`, produto → `/api/products`); invalidação por prefixo `['tenant', companyId, storeId, 'products']`.

## Relações

- **Usa:** `productsService.ts`, `useAuth`, `tenantQueryKey`.
- **Usado por:** `src/pages/products.tsx`.

## Notas

- O catálogo faz `pageSize=10000` uma vez por filtro e pagina localmente na página.
- A service layer é responsável por `!response.ok` e lançamento de `Error`.
- Controllers antigos da página continuam na camada de serviço; a mutation apenas atualiza cache/invalida.
