# `src/pages/api/products/units-of-measure.ts`

## Descrição

CRUD de unidades de medida. Usa `db/products.db` (tabela `unidades_medida`).

## Métodos

### `GET /api/products/units-of-measure`

**Resposta 200:** `[{ "id": 1, "sigla": "UN", "descricao": null }, ...]` ordenadas por abbreviation.

### `POST /api/products/units-of-measure`

**Body:** `{ "sigla": "...", "descricao": "..." }`.

**Validações (400):** abbreviation obrigatória; duplicada (case-insensitive).

**Resposta:** `201 {"id": <id>, "message": "Unidade de medida cadastrada com sucesso."}`.

### `PUT /api/products/units-of-measure?id=`

**Body:** `{ "sigla": "...", "descricao": "..." }`. `id` na query.

**Resposta:** `200 {"message": "Unidade de medida atualizada com sucesso."}`.

### `DELETE /api/products/units-of-measure?id=`

**Resposta:** `200 {"message": "Unidade de medida apagada com sucesso."}`.

## Regras e Observações

- `id=1` (unit "UN") não pode ser apagada.
- Siglas presentes em `seedUoms` não podem ser atualizadas (lança erro na camada de banco).
- Ao apagar unit com itens associados, os itens são migrados para `UN` (id 1).
- Erros → `500`; métodos não suportados → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).