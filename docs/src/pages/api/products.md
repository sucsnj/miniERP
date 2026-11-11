# `src/pages/api/products.ts`

> REST do catálogo de produtos (`db/products.db`): CRUD, filtros e toggle de status. Apenas tipo `PRODUTO`.

## O que faz

- `GET`: filtros `search`, `categoria_id`, `marca_id`, `fornecedor_id`, `preco_venda`, `ativo` (`ATIVO`/`INATIVO`/`TODOS`), `page`, `pageSize`.
- `POST`: `{ action: 'toggle-status', id, ativo }` ou cadastro de produto; valida tipo, nome, categoria/marca/fornecedor, unidades, código interno e barcodes duplicados.
- `PUT`: atualiza produto; código interno não pode ser alterado; barcodes validados excluindo o próprio item.
- `DELETE { id }`: exclui; demais métodos → `405` (`Allow: GET, POST, PUT, DELETE`).

## Relações

- **Usa:** `src/database/productsDb.ts`, `parseNumber` de `src/utils/number.ts`.
- **Usado por:** `productsService`; `../products.md` e `../registration.md`.

## Notas

- Serviços usam `./products/servicos.md`.
- `codigos_barras`/`unidades_medida` são opcionais; é garantido exatamente um mainBarcode.
