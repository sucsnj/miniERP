# `src/pages/api/admin/stores.ts`

> Administração de lojas da empresa.

## O que faz

- `GET`: lista lojas ativas/inativas do tenant.
- `POST`: cria loja (`name`); máximo de 2 por empresa (validação + trigger no banco).
- `PATCH`: renomeia (`name`) ou ativa/desativa (`active`); a empresa precisa manter ao menos 1 loja ativa.

## Relações

- **Usa:** `requireAdminApi`, `src/database/adminRepository.ts`.
- **Usado por:** `/admin`, seletor de loja.
