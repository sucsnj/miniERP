# `src/database/produtosDb.ts`

> Persistência do catálogo de produtos/serviços (SQLite `db/produtos.db`) via `better-sqlite3`. Gerencia tabelas auxiliares, seeds, migrações, sincronização de sequência e operações de CRUD/estoque.

## O que faz

- Abre conexão com `db/produtos.db`, pragmas `journal_mode=WAL`, `synchronous=FULL`, `foreign_keys=ON`.
- Cria tabelas: `categorias`, `marcas`, `fornecedores`, `unidades_medida`, `itens`, `item_codigos_barras`, `item_unidades_medida`, `servicos`, `movimentacoes_estoque`.
- Aplica seeds (`seedUoms`, `seedCategories`, `seedBrands`, `seedSuppliers`) quando vazias; realiza migrações para coluna `multiplicador_unidade` em `itens`, normalização de `servicos` (adiciona colunas, remove `ativo` se existir) e migração de dados de unidades de medida da tabela `itens` para `item_unidades_medida`.
- Sincroniza sequência compartilhada (`sqlite_sequence`) entre `itens` e `servicos` via `syncSharedAutoincrementSequence()` (chamado ao inicializar e em `insertService`/`insertItem` contextos relevantes).
- Fornece helpers CRUD para cadastros auxiliares (com regras de proteção para registros padrão: categoria Geral id=1, marca Outros id=1, fornecedor Sem fornecedor id=1, unidade UN id=1 — impede apagar/atualizar em casos restritos).
- Gerencia movimentações de estoque com transação (`insertStockMovement` = `db.transaction(insertStockMovementRaw)`), calculando `estoque_final` conforme tipo (`ENTRADA/SAIDA/AJUSTE`).
- Produtos/itens: valida unicidade (`checkDuplicateInternalCode`, `checkDuplicateBarcode`), busca paginada com filtros, obtém por id/código de barras, insere/atualiza/exclui e alterna status (`toggleItemStatus`).
- Serviços: valida unicidade, busca paginada com filtros, obtém por id, insere/atualiza/exclui (gera `codigo_interno` = string do id quando não informado).

## Relações

- **Usa:** [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), [`src/database/seeds.ts`](./seeds.md)
- **Usado por:** [`src/pages/api/produtos*.ts`](../pages/api/)

## Notas

- `insertItem` inicializa estoque com `0` e gera movimentação `ENTRADA` com `quantidade > 0` (não gera movimentação para estoque inicial 0). `updateItem` gera movimentação `AJUSTE` quando estoque atual difere do alvo.
- Ao inserir produto, preenche `item_unidades_medida` (ou copia unidade principal caso ausente). Ao atualizar, remove e reinsere registros relacionados.
- `checkDuplicateBarcode` retorna o código de barras duplicado encontrado (ou `null`).
- `syncSharedAutoincrementSequence()` garante IDs sequenciais compartilhados entre `itens` e `servicos`.
- Fase 1 (carrinho/estoque): `applySaleStockMovement(saleId, items, movementType)` aplica `SAIDA`/`ENTRADA` para produtos em transação; `applyStockAdjustments(saleId, adjustments)` aplica ajustes calculados (edição). Ambos reutilizam `insertStockMovementRaw` e registram descrição com o id da venda.