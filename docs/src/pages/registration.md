# `src/pages/registration.tsx`

> Cadastro/edição de produtos e serviços (`/registration`), com códigos de barras, ajuste de estoque e importação XML.

## O que faz

- Dois fluxos: novo (direto ou `?novoImport=1&nome=&purchasePrice=&estoque=&unidade=&ean=&internalCode=`) e edição (`?id=X`).
- Carrega auxiliares via `useProductsOptions` e, na edição, item via `useProductsCatalog` (somente quando `?id=` existe).
- Salva produto/serviço via mutation TanStack Query (`useProductMutations`), redireciona para `/products` após 2s.
- Gerencia múltiplos códigos de barras (`BarcodeManager`) e CRUD auxiliar (categoria, marca, fornecedor, unit) via hooks.
- Histórico de movimentações do estoque via `useStockMovements` (carrega ao abrir o modal).
- Guarda alterações não salvas (`beforeunload` + guard do router + `ConfirmDialog`).

## Relações

- **Usa:** `useProductsCatalog`, `useProductsOptions`, `useProductMutations`, `useStockMovements`; componentes `ItemForm`, `BarcodeManager`, `CatalogEntityModal` e modais XML/estoque; hooks `useCategory`, `useBrand`, `useSupplier`, `useUnitOfMeasure`.
- **Usado por:** `./products.md` (edição via `?id=`) e `./api/products/items.md` (cadastro rápido).

## Notas

- Cadastro rápido via XML: `preco_venda = preco_compra × 1,5` (margem 50%).
- Ajuste de estoque no formulário não persiste de imediato: soma no campo e exige "Salvar Alterações".
- A query de edição só é habilitada com `?id=`; sem parâmetro, o catálogo não é pré-carregado.
