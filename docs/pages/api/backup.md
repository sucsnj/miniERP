# `src/pages/api/backup.ts`

## Descrição

Endpoint para criar backup do banco de vendas (`db/vendas.db`).

## Métodos

### `POST`

Gera o backup.

- **Body**: nenhum.
- **Resposta 200**: `{ message: 'Backup criado', path }` — `path` aponta para `backup-<YYYY-MM-DD>.db` na raiz do projeto (via `backupDatabase()` em `src/database/db.ts`).
- **Erros**: 500 `{ error: 'Erro no backup' }`.

## Observações

- Único método aceito é `POST`; outros retornam **405**.
- Consumido por `fazerBackup` em `src/services/vendasService.ts`.