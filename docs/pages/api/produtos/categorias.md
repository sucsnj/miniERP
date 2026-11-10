# `src/pages/api/produtos/categorias.ts`

## Descrição

CRUD de categorias de produtos. Usa `db/produtos.db` (tabela `categorias`).

## Métodos

### `GET /api/produtos/categorias`

**Resposta 200:** `[{ "id": 1, "nome": "Geral", "descricao": null }, ...]` ordenadas por nome.

### `POST /api/produtos/categorias`

**Body:** `{ "nome": "...", "descricao": "..." }`.

**Validações (400):** nome obrigatório; nome duplicado (case-insensitive).

**Resposta:** `201 {"id": <id>, "message": "Categoria cadastrada com sucesso."}`.

### `PUT /api/produtos/categorias?id=`

**Body:** `{ "nome": "...", "descricao": "..." }`. `id` na query (obrigatório e numérico).

**Resposta:** `200 {"message": "Categoria atualizada com sucesso."}`.

### `DELETE /api/produtos/categorias?id=`

**Resposta:** `200 {"message": "Categoria apagada com sucesso."}`.

## Regras e Observações

- `id=1` (categoria "Geral") não pode ser atualizada/apagada — `produtosDb` lança erro.
- Ao apagar categoria com itens associados, os itens são migrados para a categoria `Geral` (id 1) antes do DELETE.
- Erros → `500 {"error": "..."}`; métodos não suportados → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).