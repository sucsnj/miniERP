# `src/pages/api/produtos.ts`

## Descrição

Endpoint REST do catálogo de **produtos** (domínio Produtos/Estoque). Gerencia itens do tipo `PRODUTO`, validação de duplicidade, unidades de medida/barcodes e alternância de status. Usa `db/produtos.db`.

> Serviços NÃO passam por esta rota — usam `/api/produtos/servicos`.

## Métodos

### `GET /api/produtos`

Busca paginada, com busca e filtros.

**Query params**

- `search` — busca por nome, código interno, referência ou código de barras.
- `categoria_id`, `marca_id`, `fornecedor_id`, `preco_venda` — filtros numéricos.
- `ativo` — `ATIVO` (1), `INATIVO` (0) ou `TODOS`/ausente (todos).
- `page` (default 1), `pageSize` (default 10).

**Resposta 200**

```json
{
  "items": [
    {
      "id": 1, "tipo": "PRODUTO", "nome": "...", "descricao": null,
      "categoria_id": 1, "categoria_nome": "Geral",
      "unidade_medida_id": 1, "unidade_medida_sigla": "UN",
      "unidade_medida_descricao": "...",
      "marca_id": 1, "marca_nome": "Outros",
      "fornecedor_id": 1,
      "preco_compra": 0, "margem_lucro": 0, "preco_venda": 0,
      "estoque": 0, "estoque_total": 0, "multiplicador_unidade": 1,
      "codigo_interno": "1", "referencia": null, "ativo": 1,
      "data_criacao": "...", "data_atualizacao": "...",
      "codigos_barras": [{ "codigo_barras": "...", "principal": 1 }],
      "unidades_medida": []
    }
  ],
  "total": 0, "page": 1, "pageSize": 10, "totalPages": 0
}
```

### `POST /api/produtos`

Cria produto. Duas ações:

**1. `{ action: 'toggle-status', id, ativo }`** — ativa/desativa (0 ou 1). 400 se ID/status inválidos; 404 se item inexistente.

**2. Cadastro normal** — body:

```json
{
  "tipo": "PRODUTO",
  "nome": "...", "descricao": "...",
  "categoria_id": 1, "unidade_medida_id": 1, "marca_id": 1, "fornecedor_id": 1,
  "preco_compra": 0, "margem_lucro": 0, "preco_venda": 0, "estoque": 0,
  "multiplicador_unidade": 1, "codigo_interno": "...", "referencia": "...",
  "ativo": 1,
  "codigos_barras": [{ "codigo_barras": "...", "principal": 1 }],
  "unidades_medida": [{ "unidade_medida_id": 1, "multiplicador_unidade": 1, "principal": 1 }]
}
```

**Validações (400):** tipo só `PRODUTO`; nome obrigatório; categoria, marca e fornecedor válidos; unidade de medida válida (via `unidades_medida` ou `unidade_medida_id`); código interno duplicado; barcodes duplicados (# no payload e/ou no banco); garante exatamente 1 unidade/barcode principal.

**Respostas:** `201 {"id": <id>, "message": "Item cadastrado com sucesso."}`; `400`/`500` com `{"error": "..."}`.

### `PUT /api/produtos`

Atualiza produto. Body igual ao POST mais `id`.

**Validações extras (400):** ID obrigatório; item existente (404); código interno **não pode ser alterado** (comparado ao valor salvo); barcodes duplicados excluindo o próprio item.

**Resposta:** `200 {"message": "Item atualizado com sucesso."}`.

### `DELETE /api/produtos`

Exclui produto.

**Body:** `{ "id": 1, "tipo": "PRODUTO" }`.

**Respostas:** `200 {"message": "Item excluído com sucesso."}`; `400` ID obrigatório; `404` item não encontrado.

## Observações

- `DELETE` ignora o `tipo` enviado (valida apenas o `id`).
- O estoque inicial positivo do produto gera uma movimentação `ENTRADA` "Estoque inicial via cadastro" (ver `produtosDb.ts`).
- Métodos não suportados → `405` com `Allow: GET, POST, PUT, DELETE`.
- `unidades_medida`/`codigos_barras` são opcionais; defaults aplicados na camada de banco (`multiplicador_unidade` 1, sem barcodes, unidade principal = primeira).