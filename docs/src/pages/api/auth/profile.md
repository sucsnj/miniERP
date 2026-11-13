# `src/pages/api/auth/profile.ts`

> API de perfil do administrador autenticado.

## O que faz

- `PATCH` (admin-only):
  - Atualiza nome, apelido e e-mail do administrador atual.
  - Ou, com `{ contact }`, atualiza telefone e endereço (logradouro, número, complemento, bairro, cidade, UF e CEP).
- Valida nome (2–120 caracteres), apelido (mínimo 4 letras), e-mail, telefone, UF e CEP.
- Marca erros de unicidade de apelido/e-mail como erro 400.
- Retorna o contexto de sessão renovado (`{ user }`).
- A alteração da foto vive em [`/api/avatar`](../avatar.md); a senha em `./profile/password.md`.

## Relações

- **Usa:** `requireAdminApi`, `getAuthContext`, `validateLogin`, funções de normalização de `serverAuth`, `users` (Supabase).
- **Usado por:** `src/services/profileService.ts`.

## Notas

- Apenas administradores podem chamar este endpoint.
