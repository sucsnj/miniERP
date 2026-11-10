# `src/pages/api/contas/backup.ts`

> Arquivo original do rascunho foi nomeado `contas-backup.md`; o endpoint real vive em `src/pages/api/contas/backup.ts`.

## Descrição

Endpoint de **backup do banco de contas a pagar** (`db/contas.db`).

## Método

### `POST /api/contas/backup`

- Chama `backupContasDatabase()` (backup nativo SQLite → `db/contas-backup-YYYY-MM-DD.db`).
- Retorna `200 { message: 'Backup de contas criado', path }` (caminho do arquivo gerado).
- Em erro: `500 { error: 'Erro no backup de contas' }`.

### Outros métodos

- `405` com `Allow: POST`.

## Observações

- Apenas `POST`.
- O backup é diário por nome (sobrescreve o arquivo do mesmo dia); não há retenção automática.