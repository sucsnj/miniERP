# `src/pages/api/auth/change-password.ts`

> Troca de senha do usuário autenticado.

## O que faz

- Valida sessão e senha atual.
- Valida senha nova (8–128 caracteres, letras, número e especial seguro).
- Atualiza hash no banco.
- Revoga todas as sessões do usuário e abre uma nova sessão para o dispositivo atual.

## Relações

- **Usa:** `src/utils/password.ts`, `src/utils/serverAuth.ts`, Supabase server client.
- **Usado por:** futura tela de conta/settings.

## Notas

- Revogação total via `revokeUserSessions`.
