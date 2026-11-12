# `src/contexts/AuthContext.tsx`

> Contexto global do usuário autenticado.

## O que faz

- Carrega `/api/auth/me` no mount.
- Expõe `user`, `loading`, `login(identifier, password)`, `logout()`, `refresh()` e `setUser`.
- Login aceita `login` ou `email` e redireciona para `/`.
- Logout chama `/api/auth/logout` e redireciona para `/login`.

## Relações

- **Usa:** API routes `src/pages/api/auth/*`; Next Router.
- **Usado por:** `_app`, páginas de login/setup e futuramente UI por role.

## Notas

- `AuthUser` carrega `userId`, empresa, role, loja atual e dados do usuário.
- Contexto é normalizado server-side; não aceitar empresa/loja vindos do cliente.
