# `src/pages/api/produtos/movimentacoes.ts`

## Descrição

Endpoint de **movimentações de estoque** (`movimentacoes_estoque` em `db/produtos.db`).

## Métodos

### `GET /api/produtos/movimentacoes?item_id=`

**Query obrigatória:** `item_id` (numérico).

**Resposta 200:** `MovimentacaoEstoqueData[]` ordenadas por `data_movimentacao DESC, id DESC`:

```json
[
  {
    "id": 1, "item_id": 1, "item": "Nome do produto",
    "tipo": "ENTRADA", "quantidade": 10, "estoque_final": 10,
    "descricao": "Estoque inicial via cadastro", "data_movimentacao": "..."
  }
]
```

**400** se `item_id` ausente/NaN.

### `POST /api/produtos/movimentacoes`

**Body:**

```json
{
  "item_id": 1,
  "tipo": "ENTRADA",
  "quantidade": 10,
  "descricao": "Compra"
}
```

`tipo`: `ENTRADA` | `SAIDA` | `AJUSTE`.

**Validações (400):** `item_id` numérico; tipo em um dos três valores; `quantidade` numérica (regras de sinal aplicadas na camada de banco). **404** se item não existe.

**Resposta:** `201 {"id": <movement.id>, "message": "Movimentação de estoque registrada com sucesso."}`.

## Observações

- `SAIDA` subtrai do estoque; `ENTRADA`/`AJUSTE` somam (com validações de quantidade na camada de banco — ver `produtosDb.md`).
- Apenas `GET`/`POST` são suportados (`Allow: GET, POST`); demais → `405`.