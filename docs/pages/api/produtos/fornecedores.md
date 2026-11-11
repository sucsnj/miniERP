# `src/pages/api/products/fornecedores.ts`

## Descrição

CRUD de fornecedores. Usa `db/products.db` (tabela `fornecedores`).

## Métodos

### `GET /api/products/fornecedores`

**Resposta 200:** `[{ "id": 1, "nome": "Sem fornecedor" }, ...]` ordenados por nome.

### `POST /api/products/fornecedores`

**Body:** `{ "nome": "..." }`.

**Validações (400):** nome obrigatório; duplicado (case-insensitive).

**Resposta:** `201 {"id": <id>, "message": "Fornecedor cadastrado com sucesso."}`.

### `PUT /api/products/fornecedores?id=`

**Body:** `{ "nome": "..." }`. `id` na query.

**Resposta:** `200 {"message": "Fornecedor atualizado com sucesso."}`.

### `DELETE /api/products/fornecedores?id=`

**Resposta:** `200 {"message": "Fornecedor apagado com sucesso."}`.

## Regras e Observações

- `id=1` (fornecedor "Sem fornecedor") não pode ser atualizado/apagado.
- Ao apagar fornecedor com itens associados, os itens são migrados para "Sem fornecedor" (id 1).
- Erros → `500`; métodos não suportados → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).