# `src/pages/api/backup.ts`

> Cria o backup do banco de vendas (`db/vendas.db`).

## O que faz

- `POST` sem corpo: chama `backupDatabase()` e responde `200 { message: 'Backup criado', path }`.
- Erro → `500 { error: 'Erro no backup' }`.
- Outros métodos → `405` (`Allow: POST`).

## Relações

- **Usa:** `backupDatabase` de `src/database/db.ts`.
- **Usado por:** `backupDatabase` em `src/services/vendasService.ts`; `../index.md` (botão "Fazer Backup").

## Notas

- `path` aponta para `backup-<YYYY-MM-DD>.db` na raiz do projeto.
