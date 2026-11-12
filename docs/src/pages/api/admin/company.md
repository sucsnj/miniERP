# `src/pages/api/admin/company.ts`

> Administração da própria empresa.

## O que faz

- `GET`: retorna a empresa do tenant atual.
- `PATCH`: atualiza o nome da empresa (`name`, 2–120 caracteres).

## Relações

- **Usa:** `requireAdminApi`, `src/database/adminRepository.ts`.
- **Usado por:** `/admin`.

## Notas

- Admin gerencia somente a empresa à qual pertence.
- Após `PATCH`, o frontend chama `AuthContext.refresh()` para refletir o novo nome na UI.
