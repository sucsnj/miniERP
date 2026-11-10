# `src/pages/api/produtos/unidades-medida.ts`

## Descrição

CRUD de unidades de medida. Usa `db/produtos.db` (tabela `unidades_medida`).

## Métodos

### `GET /api/produtos/unidades-medida`

**Resposta 200:** `[{ "id": 1, "sigla": "UN", "descricao": null }, ...]` ordenadas por sigla.

### `POST /api/produtos/unidades-medida`

**Body:** `{ "sigla": "...", "descricao": "..." }`.

**Validações (400):** sigla obrigatória; duplicada (case-insensitive).

**Resposta:** `201 {"id": <id>, "message": "Unidade de medida cadastrada com sucesso."}`.

### `PUT /api/produtos/unidades-medida?id=`

**Body:** `{ "sigla": "...", "descricao": "..." }`. `id` na query.

**Resposta:** `200 {"message": "Unidade de medida atualizada com sucesso."}`.

### `DELETE /api/produtos/unidades-medida?id=`

**Resposta:** `200 {"message": "Unidade de medida apagada com sucesso."}`.

## Regras e Observações

- `id=1` (unidade "UN") não pode ser apagada.
- Siglas presentes em `seedUoms` não podem ser atualizadas (lança erro na camada de banco).
- Ao apagar unidade com itens associados, os itens são migrados para `UN` (id 1).
- Erros → `500`; métodos não suportados → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).