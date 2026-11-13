# `src/pages/api/auth/profile/password.ts`

> Troca de senha do administrador autenticado.

## O que faz

- `POST` (admin-only): valida sessão, senha atual, política da nova senha e confirmação indireta.
- Atualiza o hash `scrypt` do usuário.
- Revoga as outras sessões do usuário e mantém a sessão atual.
- Retorna o contexto renovado (`{ user }`).

## Relações

- **Usa:** `requireAdminApi`, `getAuthContext`, `revokeUserSessions`, `hashPassword`, `validatePassword`, `verifyPassword`, `users` (Supabase).
- **Usado por:** `src/services/profileService.ts`.

## Notas

- Apenas administradores podem trocar a senha por este endpoint.
- A senha nova continua fora do hash em texto plano e nunca é devolvida.
