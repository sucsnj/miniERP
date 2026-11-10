# `src/database/tabelaDb.ts`

## Descrição

Módulo de persistência do **histórico/cache de buscas** da tabela de medicamentos — banco SQLite `db/tabela.db` via `better-sqlite3`. Singleton criado no import do módulo.

## Conexão e tabela

- `dbPath = db/tabela.db`; `PRAGMA journal_mode = WAL` e `PRAGMA synchronous = FULL`.
- Tabela `tabela_search_history`:

```
id                INTEGER PRIMARY KEY AUTOINCREMENT
query             TEXT NOT NULL
normalized_query  TEXT NOT NULL UNIQUE   -- chave do cache
result_json       TEXT NOT NULL           -- resultados serializados em JSON
result_count      INTEGER NOT NULL
updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
```

## Funções

```ts
findTabelaSearchHistory(normalizedQuery: string): Record<string, any> | null
saveTabelaSearchHistory(query, normalizedQuery, results: any[])       // upsert e depois prune
getRecentTabelaSearchHistory(): any[]                                 // últimos 25 por updated_at DESC
clearTabelaSearchHistory(): better-sqlite3.RunResult                  // DELETE de tudo
pruneTabelaSearchHistory(): better-sqlite3.RunResult                  // não exportado (local)
```

## Comportamentos

- `saveTabelaSearchHistory` usa `INSERT ... ON CONFLICT(normalized_query) DO UPDATE` — reconsultar a mesma consulta normalizada atualiza `result_json`, `result_count` e `updated_at` em vez de duplicar linha.
- Logo após inserir/atualizar, chama `pruneTabelaSearchHistory()`, que apaga tudo exceto os **25 registros mais recentes** por `updated_at`.
- `getRecentTabelaSearchHistory` retorna só `id, query, result_count, updated_at` (sem o JSON), com limite `LIMIT 25`.

## Observações

- O limite real mantido no banco é **25** consultas; a página `tabela.tsx` exibe o texto "Últimas 100 buscas gravadas no cache" — **discrepância entre UI e persistência** (a UI nunca chega a 100, pois o prune corta em 25).
- `result_json` guarda o array cru de resultados em texto — eficiente para cache, porém sem schema/tipagem ao ler de volta (`JSON.parse` na API).
- Consumido exclusivamente por `src/pages/api/tabela.ts`.