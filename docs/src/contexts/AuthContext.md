# `src/contexts/AuthContext.tsx`

> Contexto global do usuário autenticado.

## O que faz

- Carrega `/api/auth/me` com `cache: 'no-store'` e header `x-session-heartbeat: 1`; a resposta usa `Cache-Control: no-store`.
- Programa a validação para o deadline (`sessionExpiresAt`/`sessionAbsoluteExpiresAt`); também verifica a sessão a cada 30s e no retorno da aba (`focus`/`visibility`).
- `refresh()` tem trava contra chamadas concorrentes; em 401 limpa `user`, permitindo que `AuthGate` redirecione para `/login`.
- Quando faltarem no máximo 24h para a expiração efetiva (rolling ou absoluta), exibe um toast intermitente de aviso.
- Expõe `user`, `loading`, `login(identifier, password)`, `logout()`, `refresh()` e `setUser`.
- Login aceita `login` ou `email` e redireciona para `/`.
- Logout chama `/api/auth/logout` e redireciona para `/login`.

## Relações

- **Usa:** API routes `src/pages/api/auth/*`; Next Router.
- **Usado por:** `_app`, páginas de login/setup e UI por role.

## Notas

- `AuthUser` carrega `userId`, empresa, role, loja atual, dados do usuário, `avatarUrl`, `sessionExpiresAt`, `sessionAbsoluteExpiresAt` e `contact` (telefone e endereço).
- `sessionExpiresAt` é a janela rolling; `sessionAbsoluteExpiresAt` é o teto fixo a partir da criação.
- Contexto é normalizado server-side; não aceitar empresa/loja vindos do cliente.
