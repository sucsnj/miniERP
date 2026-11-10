# `src/database/tabelaDb.ts`

> Persistência do histórico de buscas da Tabela de Medicamentos (SQLite `db/tabela.db`) via `better-sqlite3`.

## O que faz

- Abre conexão com `db/tabela.db`, pragmas `journal_mode=WAL`, `synchronous=FULL`.
- Cria tabela `tabela_search_history` (query, normalized_query UNIQUE, result_json, result_count, updated_at).
- Salva/atualiza histórico com `ON CONFLICT(normalized_query) DO UPDATE` e mantém apenas os 25 mais recentes via `pruneTableSearchHistory()` (chamado após salvar).
- Fornece busca por `normalized_query`, listagem dos 25 recentes e limpeza completa do histórico.

## Relações

- **Usa:** [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- **Usado por:** [`src/pages/api/tabela.ts`](../pages/api/tabela.md)

## Notas

- `pruneTableSearchHistory()` é função interna (não exportada).
- `saveTableSearchHistory` serializa `results` com `JSON.stringify` e atualiza timestamps em caso de conflito.
- `getRecentTableSearchHistory` retorna apenas campos `id, query, result_count, updated_at`.