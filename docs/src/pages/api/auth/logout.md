# `src/pages/api/auth/logout.ts`

> Logout server-side.

## O que faz

- Revoga a sessão apontada pelo cookie `minierp_session`.
- Limpa o cookie (`Max-Age=0`).

## Relações

- **Usa:** `src/utils/serverAuth.ts`.
- **Usado por:** `src/contexts/AuthContext.tsx`.
