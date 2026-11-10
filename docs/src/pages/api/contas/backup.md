# `src/pages/api/contas/backup.ts`

> Backup do banco de contas a pagar (`db/contas.db`).

## O que faz

- `POST` sem corpo: chama `backupAccountsDatabase()` e responde `200 { message: 'Backup de contas criado', path }`.
- Erro → `500 { error: 'Erro no backup de contas' }`; outros métodos → `405` (`Allow: POST`).

## Relações

- **Usa:** `backupAccountsDatabase` de `src/database/contasDb.ts`.
- **Usado por:** `backupAccounts` em `contasService`; `../../contas-a-pagar.md`.

## Notas

- Backup diário por nome (sobrescreve o arquivo do mesmo dia); sem retenção automática.
