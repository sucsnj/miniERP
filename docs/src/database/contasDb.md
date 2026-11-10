# `src/database/contasDb.ts`

> Persistência de contas a pagar (SQLite `db/contas.db`) via `better-sqlite3`.

## O que faz

- Abre conexão com `db/contas.db`, pragmas `journal_mode=WAL`, `synchronous=FULL`.
- Cria tabela `contas_detalhes` (distribuidora, valor, vencimento `YYYY-MM-DD`, documento, status `Pendente|Pago`, banco_observacoes, criado_em).
- Fornece CRUD, filtros por período, marcar como pago/cancelar pagamento e backup.

## Relações

- **Usa:** [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3), [`src/utils/date.ts`](../utils/date.md) (`now`, `parseDate`)
- **Usado por:** [`src/pages/api/contas.ts`](../pages/api/contas.md), [`src/pages/api/contas-import.ts`](../pages/api/contas/import.md), [`src/pages/api/contas-backup.ts`](../pages/api/contas/backup.md)

## Notas

- `getAccountsByPeriod(year, month?)` define período de 1º dia do mês/ano até último dia (`endOf('month')`) ou até 31/12 quando `month` não informado; ordena por `vencimento DESC, id DESC`.
- `backupAccountsDatabase()` gera `db/contas-backup-<YYYY-MM-DD>.db`.