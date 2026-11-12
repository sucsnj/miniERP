# `src/hooks/useProducts.ts`

> Hook para catálogo, auxiliares, movimentações e mutations do módulo de produtos. Exporta `useProductsCatalog`, `useProductsOptions`, `useStockMovements` e `useProductMutations`.

## O que faz

- `useProductsCatalog(filters, { enabled })`: consulta `products` + `services`, unifica, ordena por nome e cacheia por filtro/tenant (`products/catalog`); permite desativar a query quando desabilitada.
- `useProductsOptions()`: carrega categorias, marcas, fornecedores e unidades de medida; expõe `setOptions` (atualização otimista do cache).
- `useStockMovements(itemId, enabled)`: consulta histórico de movimentações por tenant.
- `useProductMutations()`: `toggleStatus` otimista, `remove`, e `save` (cria/atualiza produto ou serviço conforme tipo), com invalidação por prefixo `['tenant', companyId, storeId, 'products']`.

## Relações

- **Usa:** `productsService.ts`, `useAuth`, `tenantQueryKey`.
- **Usado por:** `src/pages/products.tsx`, `src/pages/registration.tsx`.

## Notas

- O catálogo faz `pageSize=10000` uma vez por filtro e pagina localmente na página.
- A invalidação prefixada força revalidação quando produtos/serviços/movimentações/opções mudam.
- Services seguem sem marca/fornecedor e são mapeados para o shape de item do catálogo.
