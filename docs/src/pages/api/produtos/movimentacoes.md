# `src/pages/api/produtos/movimentacoes.ts`

> Movimentações de estoque (`movimentacoes_estoque` em `db/produtos.db`).

## O que faz

- `GET ?item_id=`: retorna as movimentações do item (`item_id` obrigatório).
- `POST { item_id, tipo, quantidade, descricao? }`: registra movimentação; `tipo` em `ENTRADA`|`SAIDA`|`AJUSTE`.
- `404` se o item não existe; demais métodos → `405` (`Allow: GET, POST`).

```ts
// resposta GET
[{ id, item_id, item, tipo, quantidade, estoque_final, descricao, data_movimentacao }]
```

## Relações

- **Usa:** `src/database/produtosDb.ts` (`getStockMovements`, `insertStockMovement`, `getItemById`).
- **Usado por:** `produtosService`; `../../cadastro.md` (ajuste de estoque).

## Notas

- `SAIDA` subtrai; `ENTRADA`/`AJUSTE` somam (regras de sinal na camada de banco).
