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

- **Usa:** [`/api/produtos`](../pages/api/produtos.md), [`/api/produtos/servicos`](../pages/api/produtos/servicos.md), [`/api/produtos/movimentacoes`](../pages/api/produtos/movimentacoes.md), [`/api/produtos/categorias`](../pages/api/produtos/categorias.md), [`/api/produtos/marcas`](../pages/api/produtos/marcas.md), [`/api/produtos/fornecedores`](../pages/api/produtos/fornecedores.md), [`/api/produtos/unidades-medida`](../pages/api/produtos/unidades-medida.md), [`/api/produtos/itens`](../pages/api/produtos/itens.md)
- **Usado por:** páginas/componentes de Produtos/Catálogo e fluxos de importação de NF-e

## Notas

- Quase todas as funções lançam `Error` com mensagem extraída de `errorData.error` quando `!response.ok`.
- `fetchProducts` aceita filtros (`search`, `categoria_id`, `marca_id`, `fornecedor_id`, `preco_venda`, `ativo`, paginação) e monta query string condicional.
- `previewInvoiceItems` normaliza resposta com `{ok,...}` mesmo em caso de erro HTTP.