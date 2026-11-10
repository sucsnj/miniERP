# `src/database/db.ts`

> Módulo de persistência de vendas (SQLite via `better-sqlite3`). Gerencia conexão, schema de vendas diárias, itens e consolidação mensal, além de operações CRUD e backup.

## O que faz

- Abre conexão com `db/vendas.db` (via `process.cwd()`), aplica pragmas `journal_mode=WAL`, `synchronous=FULL`, `foreign_keys=ON`.
- Cria tabelas `vendas_diarias`, `venda_itens`, `vendas_mensais` (com migração para adicionar `carrinho_id` em `vendas_diarias`).
- Fornece operações para vendas diárias, itens de venda, consolidação mensal e backup.
- Usa timestamp local via `now()` (`src/utils/date`) para `criado_em` quando não informado.

## Relações

- **Usa:** [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), [`src/utils/date.ts`](../utils/date.md) (`now`, `getLastDayOfMonth`)
- **Usado por:** [`src/pages/api/vendas.ts`](../pages/api/vendas.md), [`src/pages/api/venda-itens.ts`](../pages/api/venda-itens.md), [`src/pages/api/mensais.ts`](../pages/api/mensais.md), [`src/pages/api/backup.ts`](../pages/api/backup.md)

## Notas

- `insertDailySale` aceita `criado_em` opcional e `carrinho_id` nullable.
- `insertSaleItems` insere em lote com transação; calcula `subtotal = preco_unitario*quantidade` se ausente.
- `consolidateMonthly` calcula métricas (ticket médio, médias, melhor dia, maior venda, quantidades/totais) com base em vendas diárias e grava via `INSERT OR REPLACE`.
- `backupDatabase()` gera `backup-<YYYY-MM-DD>.db` na raiz do projeto (não em `db/`).
- Divergência histórica: documentação citava `db.db`, arquivo real é `db/vendas.db`.