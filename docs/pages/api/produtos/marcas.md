# `src/pages/api/products/marcas.ts`

## Descrição

CRUD de marcas. Usa `db/products.db` (tabela `marcas`).

## Métodos

### `GET /api/products/marcas`

**Resposta 200:** `[{ "id": 1, "nome": "Outros" }, ...]` ordenadas por nome.

### `POST /api/products/marcas`

**Body:** `{ "nome": "..." }`.

**Validações (400):** nome obrigatório; duplicado (case-insensitive).

**Resposta:** `201 {"id": <id>, "message": "Marca cadastrada com sucesso."}`.

### `PUT /api/products/marcas?id=`

**Body:** `{ "nome": "..." }`. `id` na query.

**Resposta:** `200 {"message": "Marca atualizada com sucesso."}`.

### `DELETE /api/products/marcas?id=`

**Resposta:** `200 {"message": "Marca apagada com sucesso."}`.

## Regras e Observações

- `id=1` (marca "Outros") não pode ser atualizada/apagada.
- Ao apagar marca com itens associados, os itens são migrados para "Outros" (id 1).
- Erros → `500`; métodos não suportados → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).