# `src/database/notasDb.ts`

## Descrição

Módulo de persistência de **notas fiscais importadas** — banco SQLite `db/notas.db` via `better-sqlite3`. Singleton criado no import do módulo.

## Conexão e tabela

- `dbPath = db/notas.db`; `PRAGMA journal_mode = WAL` e `PRAGMA synchronous = FULL`.
- Tabela `notas_detalhes`:

```
id             INTEGER PRIMARY KEY AUTOINCREMENT
distribuidora  TEXT NOT NULL
chave          TEXT NOT NULL
data_emissao   TEXT NOT NULL   -- data 'YYYY-MM-DD'
valor_nota     REAL NOT NULL
```

## Funções

```ts
insertNota(distribuidora, chave, dataEmissao, valorNota)              // INSERT (AUTOINCREMENT)
getNotasById(id: number): NotaDetalhe | undefined
getSumNotasByYear(ano: number): number                                 // SUM(valor_nota) do ano; 0 se vazio
getNotasByValor(valor: number): NotaDetalhe | null                     // null se valor < 0 ou sem correspondência exata
getNotasByPeriod(ano: number, mes?: number): any[]                     // ORDER BY data_emissao DESC, id DESC
getAllNotas(): any[]                                                   // ORDER BY data_emissao DESC, id DESC
deleteNota(id: number): better-sqlite3.RunResult
backupNotasDatabase(): string                                          // retorna o caminho do backup
```

## Comportamentos

- `getNotasByPeriod(ano, mes?)`:
  - Com `mes`: intervalo `{ano}-MM-01` até o fim do mês (`parseDate(...).endOf('month')`).
  - Sem `mes`: `{ano}-01-01` até `{ano}-12-31`.
  - Filtra com `substr(data_emissao, 1, 10) >= ? AND substr(data_emissao, 1, 10) <= ?` — comparando a string ISO diretamente, sem `date()` do SQLite (motivo comentado no código: `date()` interpreta offsets como UTC e troca o dia).
- `getNotasByValor(valor)`: retorna `null` para `valor < 0`; busca por igualdade exata (`valor_nota = ?`), sem múltiplos resultados.
- `getSumNotasByYear(ano)`: soma via `substr(data_emissao, 1, 10)` no mesmo intervalo anual; usa `isolation of ?? 0` para vazio.
- `backupNotasDatabase`: usa o backup nativo do SQLite (`db.backup(path)`) gerando **`notas-backup-YYYY-MM-DD.db` na raiz do projeto** (diferente dos backups de contas, que vão para `db/`). Data via `now()` (timezone `America/Recife`).

## Observações

- As funções retornam objetos `run()`/`get()`/`all()` do better-sqlite3 sem conversão extra (a API serializa os dados; listas vêm tipadas como `any[]`).
- Não há UNIQUE em `chave` nem `distribuidora`: duplicidade de notas é evitada na camada de importação (`contas/import.ts`), não no banco.
- Consumido por `src/pages/api/notas.ts` e pela importação de XML em `src/pages/api/contas/import.ts`.