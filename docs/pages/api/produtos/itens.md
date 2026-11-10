# `src/pages/api/produtos/itens.ts`

## Descrição

Endpoint **exclusivamente POST** de importação de itens a partir de XML de NF-e. Opera em dois modos definidos pelo body. Usa `db/produtos.db`.

> Nota: apesar do nome, não faz CRUD — apenas pré-visualiza e importa produtos de NF-e.

## Métodos

### `POST /api/produtos/itens` — Modo 1: Preview

**Body:** `{ "preview": true, "xml": "<conteudo do XML>", ... }`.

- Parseia o XML com `xml2js` (`parseStringPromise(explicitArray: true)`).
- Para cada `det/prod`: `cProd`, `cEAN` (ignora `SEM GTIN`), `xProd`, `uCom`, `qCom`, `vUnCom`.
- Busca correspondência no banco (por EAN, código interno em `itens`/`servicos`, nome exato) para marcar `existe`/`itemIdExistente`.
- Agrupa duplicados no mesmo lote (mesmo EAN/cProd) somando quantidades.
- Deriva `tipoMovimentacao = 'ENTRADA'` (sempre).

**Resposta 200:**

```json
{ "produtos": [{ "cProd": "1", "ean": "...", "descricao": "...", "descricaoOriginal": "...",
  "unidadeMedida": "UN", "quantidade": 10, "valorUnitario": 1.5,
  "tipoMovimentacao": "ENTRADA", "existe": false, "itemIdExistente": null }] }
```

### `POST /api/produtos/itens` — Modo 2: Importar produto

**Body:** `{ "importar": true, "produto": { ...campos do preview, ... } }`.

Fluxo:

1. Se `itemIdExistente` → `insertMovimentacaoEstoque` (`ENTRADA`, "Importação de XML de NF-e") → `200 { sucesso, id, estoqueAtualizado: true }`.
2. Senão, se `ean` já existe como barcode → mesma movimentação de estoque (200). Se o EAN já está em outro produto → `400 { error, duplicado: true }`.
3. Senão, cria produto novo com defaults:
   - `categoria_id=1` (Geral), `unidade_medida_id=1` (UN), `marca_id=1` (Outros), `fornecedor_id=1` (Sem fornecedor).
   - `preco_compra = valorUnitario`, `margem_lucro = 50`, `preco_venda = valorUnitario * 1.5` (margem padrão 50%).
   - `nome` limitado a 100 chars; `descricao = "Importado via XML da NF-e"`.
   - `estoque = quantidade`, barcode `ean` como principal.
   - → `201 { sucesso: true, id: <itemId> }`.

**400** se `preview`/`importar` sem payload válido; **500** com `{"error": ...}` em falha geral.

## Observações

- Sempre que possível usa GDV/movimentação em vez de recriar itens já cadastrados (reuso por EAN, código interno e nome).
- Não há `GET/PUT/DELETE` — a rota retorna `405` para qualquer outro método.
- A margem fixa de 50% é uma regra de negócio embutida no importador.