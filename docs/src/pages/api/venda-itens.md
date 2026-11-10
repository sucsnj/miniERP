# `src/pages/api/venda-itens.ts`

> Consulta os itens de uma venda.

## O que faz

- `GET ?vendaId=`: retorna os itens de `venda_itens` da venda (`400` se `vendaId` inválido; `500` em erro).
- Único método aceito; demais → `405` (`Allow: GET`).

## Relações

- **Usa:** `getSaleItems` de `src/database/db.ts`.
- **Usado por:** `fetchSaleItems` em `vendasService`; `./vendas.md` e `../historico.md`.

## Notas

- Itens têm `{ id, venda_id, item_id, tipo, nome, quantidade, preco_unitario, subtotal, codigo_interno, referencia, criado_em }`.
