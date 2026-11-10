# `src/pages/api/produtos/itens.ts`

> Importação de itens a partir de XML de NF-e (somente `POST`), em dois modos.

## O que faz

- **Preview** `{ preview: true, xml }`: parseia `det/prod`, marca `existe`/`itemIdExistente` (busca por EAN, código interno e nome) e agrupa duplicados no lote.
- **Importar** `{ importar: true, produto }`: se o item já existe → movimentação `ENTRADA`; senão cria produto (defaults, margem 50%) ou rejeita EAN duplicado.
- Responde preview com `{ produtos }` e importação com `{ sucesso, id, estoqueAtualizado? }`; demais métodos → `405`.

```ts
// defaults do novo produto
{ categoria_id: 1, unidade_medida_id: 1, marca_id: 1, fornecedor_id: 1,
  preco_compra: valorUnitario, margem_lucro: 50, preco_venda: valorUnitario * 1.5 }
```

## Relações

- **Usa:** `src/database/produtosDb.ts` (`insertItem`, `insertStockMovement`, ...).
- **Usado por:** `ImportItemsModal` (via `../../cadastro.md`).

## Notas

- `tipoMovimentacao` é sempre `ENTRADA`; a margem fixa de 50% é regra de negócio embutida.
