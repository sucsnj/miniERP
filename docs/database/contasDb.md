# `src/database/contasDb.ts`

## Descrição

Módulo de persistência de **contas a pagar** — banco SQLite `db/contas.db` via `better-sqlite3`. É carregado no import do módulo (singleton), criando a tabela se necessário.

## Conexão e tabela

- `dbPath = db/contas.db`; `PRAGMA journal_mode = WAL` e `PRAGMA synchronous = FULL`.
- Tabela `contas_detalhes`:

```
id          INTEGER PRIMARY KEY AUTOINCREMENT
distribuidora       TEXT NOT NULL
valor               REAL NOT NULL
vencimento          TEXT NOT NULL   -- data 'YYYY-MM-DD'
documento           TEXT NOT NULL
status              TEXT NOT NULL DEFAULT 'Pendente'  -- 'Pendente' | 'Pago'
banco_observacoes   TEXT
criado_em           DATETIME DEFAULT CURRENT_TIMESTAMP
```

## Funções

```ts
insertConta(distribuidora, valor, vencimento, documento, bancoObservacoes?)        // status novo = 'Pendente'
getContasByPeriod(ano: number, mes?: number): any[]                                 // filtro por vencimento
getContaById(id: number): any
getAllContas(): any[]                                                               // ORDER BY vencimento DESC, id DESC
updateConta(id, distribuidora, valor, vencimento, documento, bancoObservacoes?)
deleteConta(id)
payConta(id)                                                                        // status = 'Pago'
cancelPaymentConta(id)                                                              // status = 'Pendente'
backupContasDatabase(): string                                                      // retorna o caminho do backup
```

## Comportamentos

- `getContasByPeriod(ano, mes?)`:
  - Com `mes`: intervalo `{ano}-MM-01` até fim do mês (`parseDate(...).endOf('month')`).
  - Sem `mes`: `{ano}-01-01` até `{ano}-12-31`.
- `bancoObservacoes` é gravado como `null` quando ausente.
- `backupContasDatabase` usa o backup nativo do SQLite (`db.backup(path)`) gerando `db/contas-backup-YYYY-MM-DD.db` (data via `now()` — timezone `America/Recife`).

## Observações

- As funções retornam objetos `run()`/`get()`/`all()` do better-sqlite3 sem conversão extra (a API serializa `any[]`).
- `status` é string fixa (`Pendente`/`Pago`); não há FK para outras tabelas.
- Consumido pelas APIs `src/pages/api/contas.ts`, `contas/import.ts` e `contas/backup.ts`.