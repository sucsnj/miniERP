# `src/pages/api/produtos/servicos.ts`

## Descrição

Endpoint REST de **serviços** do catálogo (tabela `servicos` em `db/produtos.db`). É a rota separada do catálogo de produtos.

## Métodos

### `GET /api/produtos/servicos`

- Sem `id` — listagem paginada:
  - **Query params:** `search` (nome/código interno/referência), `categoria_id`, `page` (default 1), `pageSize` (default 10).
  - **Resposta 200:** `{ "items": ServicoData[], "total", "page", "pageSize", "totalPages" }`.
- Com `?id=` — retorna `ServicoData` ou `null` (204 sem corpo não é usado; sempre 200).

### `POST /api/produtos/servicos`

**Body:**

```json
{
  "nome": "...", "descricao": "...", "categoria_id": 1,
  "preco_venda": 0, "codigo_interno": "...", "referencia": "...", "duracao_minutos": 0
}
```

**Validações (400):** nome e categoria obrigatórios (payload normalizado com `normalizeServicoPayload`).

**Respostas:** `201` com o serviço criado (`getServicoById(id)`); `500 {"error": ...}` em falha.

### `PUT /api/produtos/servicos?id=`

**Body** igual ao POST (id na query).

**Respostas:** `200` com o serviço atualizado; `400` sem id ou sem nome/categoria; `404` serviço não encontrado.

### `DELETE /api/produtos/servicos?id=`

**Respostas:** `200 {"message": "Serviço excluído com sucesso."}`; `400` sem id; `404` não encontrado.

## Observações

- `normalizeServicoPayload` trata body ausente/`non-object`, trima strings e converte `categoria_id`/`preco_venda`/`duracao_minutos` para números (fallback 0).
- Código interno/auto-geração: `insertServico` grava o próprio ID como `codigo_interno` quando vazio (ver `produtosDb.md`).
- `405 {"error": "Método não permitido."}` para métodos fora de GET/POST/PUT/DELETE.