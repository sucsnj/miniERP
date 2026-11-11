# `src/pages/api/vendas.ts`

> REST das vendas diárias: registra, lista, atualiza e exclui vendas (e seus itens).

## O que faz

- `GET ?mes=&ano=&filtro=`: lista vendas do mês; `filtro` (`positivas`|`negativas`|`todas`, default `todas`).
- `POST { data, valor, observacoes?, criado_em?, itens? }`: registra a venda e insere os itens; responde `200 { message, id }`.
- `PUT`/`DELETE { id, ... }`: só permitem vendas com até **2 dias** (senão `403`); o PUT substitui os itens.
- Demais métodos → `405` (`Allow: POST, PUT, DELETE, GET`).

## Relações

- **Usa:** `src/database/db.ts`, `parseCurrency`, `toDate` e `canEdit` (`src/utils/edit.ts`).
- **Usado por:** `salesService`; `../index.md` e `../historico.md`.

## Notas

- `itens` aceita
- Fase 2: `POST` aplica movimentação `SAIDA` de estoque para itens `PRODUTO` via `applySaleStockMovement`; em falha, a venda é revertida.
- Fase 3: `PUT` calcula ajustes com `getSaleStockAdjustments` e aplica via `applyStockAdjustments` (entrada/saída incremental). `id`/`preco_venda` (carrinho) ou `item_id`/`preco_unitario` (banco); `subtotal = preco_unitario × quantidade`.
- Validação de data/valor em `src/utils/validation.ts`.
