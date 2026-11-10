# `src/pages/api/venda-itens.ts`

## Descrição

API REST para consulta de itens de uma venda. Endpoint interno em `src/pages/api/venda-itens.ts`.

## Métodos

### `GET`

Busca os itens associados a uma venda.

- **Query params**: `vendaId` (obrigatório e numérico).
- **Resposta 200**: array de itens de `venda_itens` (`{ id, venda_id, item_id, tipo, nome, quantidade, preco_unitario, subtotal, codigo_interno, referencia, criado_em }`).
- **Erros**: 400 `{ error: 'vendaId inválido' }`; 500 `{ error, details }`.

## Observações

- Única operação exposta é `GET`; outros métodos retornam **405**.
- Usado pelo serviço `buscarVendaItens` em `src/services/vendasService.ts`.
- Persistência em `getVendaItens` de `src/database/db.ts`.