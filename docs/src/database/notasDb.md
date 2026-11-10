# `src/database/notasDb.ts`

> Persistência de notas fiscais (SQLite `db/notas.db`) via `better-sqlite3`.

## O que faz

- Abre conexão com `db/notas.db`, pragmas `journal_mode=WAL`, `synchronous=FULL`.
- Cria tabela `notas_detalhes` (distribuidora, chave, data_emissao `YYYY-MM-DD`, valor_nota).
- Fornece inserção, busca por id/valor/período/todas, soma por ano, exclusão e backup.

## Relações

- **Usa:** [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), [`src/utils/date.ts`](../utils/date.md) (`now`, `parseDate`)
- **Usado por:** [`src/pages/api/notas.ts`](../pages/api/notas.md)

## Notas

- `getInvoicesByPeriod` filtra por `substr(data_emissao,1,10)` entre datas (evita interpretação UTC do SQLite ao usar `date()` com strings com offset).
- `getInvoiceSumByYear` soma `valor_nota` para o ano; retorna `0` se não houver resultados.
- `getInvoicesByAmount` retorna `null` se `amount < 0`.
- `backupInvoicesDatabase()` gera `notas-backup-<YYYY-MM-DD>.db` na raiz do projeto (fora de `db/`).