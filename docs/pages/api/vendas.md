# `src/pages/api/vendas.ts`

## Descrição

API REST para operações de vendas diárias. Endpoint interno em `src/pages/api/vendas.ts`.

## Métodos

### `GET`

Busca vendas de um mês.

- **Query params**: `mes`, `ano` (números) e `filtro` (`positivas` | `negativas` | `todas`; valor inválido cai em `todas`).
- **Resposta 200**: array de vendas de `vendas_diarias` (data, valor, observações, carrinho_id, criado_em).
- **Resposta 500**: `{ error, details }`.

### `POST`

Registra uma venda.

- **Body**: `{ data, valor, observacoes?, criado_em?, itens? }`.
  - `valor` aceita número ou texto (normalizado por `validateCurrency`).
  - `itens` (opcional): array com `{ id, tipo, nome, quantidade, preco_venda?, preco_unitario?, codigo_interno?, referencia? }` — inseridos em `venda_itens` vinculados ao novo id.

### Normalização de itens (`ItemVendaApi`)

Antes de gravar, o array é mapeado para `VendaItemInput` via interface local `ItemVendaApi` (que aceita tanto `id`/`preco_venda` do carrinho do cliente quanto `item_id`/`preco_unitario` vindos do banco):

- **POST**: `item_id` = `item.id`; `preco_unitario` = `preco_venda ?? preco_unitario ?? 0`; `subtotal` = `preco_unitario * quantidade`.
- **PUT**: `item_id` = `item.item_id ?? item.id`; `preco_unitario` = `preco_unitario ?? preco_venda ?? 0`; `subtotal` = `preco_unitario * quantidade`.
- `codigo_interno`/`referencia` vazios (null/undefined) viram `undefined`; o bind em `insertVendaItens` coage para `NULL`.
- **Resposta 200**: `{ message: 'Venda registrada com sucesso', id }`.
- **Erros**: 400 `{ error }` (data/valor inválidos); 500 `{ error, details }`.

### `PUT`

Atualiza venda existente.

- **Body**: `{ id, data, valor, observacoes?, itens? }`.
- Regra: só permite edição de vendas com até **2 dias** de idade (`isEditableDate` sobre a data original). Fora disso retorna **403**.
- Substitui os itens: remove os existentes (`deleteVendaItens`) e reinsere os novos.
- **Resposta 200**: `{ message: 'Venda atualizada com sucesso' }`.
- **Erros**: 400 (dados inválidos), 404 (venda não encontrada), 403 (fora do período editável), 500.

### `DELETE`

Exclui venda existente.

- **Body**: `{ id }`.
- Regra: mesma janela de **até 2 dias**; fora dela retorna **403**.
- **Resposta 200**: `{ message: 'Venda excluída com sucesso' }`.
- **Erros**: 400 (id obrigatório), 404, 403, 500.

## Observações

- Métodos não suportados retornam **405** com `Allow` header.
- Validações de `data` e `valor` centralizadas em `src/utils/validation.ts` (`validateDate`, `validateCurrency`, `isEditableDate`).
- Persistência em `src/database/db.ts` (`db/vendas.db`).