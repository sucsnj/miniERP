# `src/services/produtosService.ts`

> Cliente HTTP via `fetch` para o domínio de produtos, serviços, estoque e cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida). Também realiza pré-visualização/importação de itens via XML de NF-e.

## O que faz

- Define interfaces: `BarcodeData`, `ItemData`, `ServiceData`, `ServiceInput`, `StockMovementData`, `StockMovementInput`, `PagedResult<T>`, `CategoryData`, `BrandData`, `SupplierData`, `UnitOfMeasureData`, `ImportedProduct`, `InvoiceItemsPreviewResult`, `InvoiceItemImportResult`.
- Produtos: `fetchProducts`, `registerProduct`, `updateProduct`, `deleteProduct`, `toggleProductStatus` (chama `/api/produtos`, com tratamento de erro via `response.json()`).
- Serviços: `fetchServices`, `fetchServiceById`, `registerService`, `updateService`, `deleteService` (chama `/api/produtos/servicos`).
- Movimentações de estoque: `fetchStockMovements`, `registerStockMovement` (chama `/api/produtos/movimentacoes`).
- Cadastros auxiliares: CRUD completo para categorias, marcas, fornecedores e unidades de medida via endpoints `/api/produtos/<entidade>`.
- Importação NF-e: `previewInvoiceItems(xml)` (POST `/api/produtos/itens` com `{xml, preview:true}`) e `importInvoiceItem(product)` (POST com `{importar:true, produto}`), retornando resultados normalizados (`ok`, flags, `error`).

## Relações

- **Usa:** [`/api/produtos`](../pages/api/products.md), [`/api/produtos/servicos`](../pages/api/products/services.md), [`/api/produtos/movimentacoes`](../pages/api/products/stock-movements.md), [`/api/produtos/categorias`](../pages/api/products/categories.md), [`/api/produtos/marcas`](../pages/api/products/brands.md), [`/api/produtos/fornecedores`](../pages/api/products/suppliers.md), [`/api/produtos/unidades-medida`](../pages/api/products/units-of-measure.md), [`/api/produtos/itens`](../pages/api/products/items.md)
- **Usado por:** páginas/componentes de Produtos/Catálogo e fluxos de importação de NF-e

## Notas

- Quase todas as funções lançam `Error` com mensagem extraída de `errorData.error` quando `!response.ok`.
- `fetchProducts` aceita filtros (`search`, `categoria_id`, `marca_id`, `fornecedor_id`, `preco_venda`, `ativo`, paginação) e monta query string condicional.
- `previewInvoiceItems` normaliza resposta com `{ok,...}` mesmo em caso de erro HTTP.