# `src/pages/api/auth/profile.ts`

> API de perfil do administrador autenticado.

## O que faz

- `PATCH` (admin-only): atualiza nome, apelido e e-mail do administrador atual.
- Valida nome (2–120 caracteres), apelido (mínimo 4 letras) e e-mail válido.
- Marca erros de unicidade de apelido/e-mail como erro 400.
- Retorna o contexto de sessão renovado (`{ user }`).

## Relações

- **Usa:** `requireAdminApi`, `getAuthContext`, `validateLogin`, funções de normalização de `serverAuth`, `users` (Supabase).
- **Usado por:** `src/services/profileService.ts`.

## Notas

- A alteração da foto vive em `./profile/avatar.md`; a senha em `./profile/password.md`.
- Apenas administradores podem chamar este endpoint.
