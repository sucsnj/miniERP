# `src/contexts/AuthContext.tsx`

> Contexto global do usuário autenticado.

## O que faz

<<<<<<< HEAD
- Carrega `/api/auth/me` no mount e verifica sessão a cada 30s quando autenticado; também verifica no retorno da aba (`focus`/`visibility`).
- `refresh()` tem trava contra chamadas concorrentes; em 401 limpa `user`, permitindo que `AuthGate` redirecione para `/login`.
=======
- Carrega `/api/auth/me` com `cache: 'no-store'` e header `x-session-heartbeat: 1`; a resposta usa `Cache-Control: no-store`.
- Programa a validação para o deadline (`sessionExpiresAt`/`sessionAbsoluteExpiresAt`); também verifica a sessão a cada 30s e no retorno da aba (`focus`/`visibility`).
- `refresh()` tem trava contra chamadas concorrentes; em 401 limpa `user`, permitindo que `AuthGate` redirecione para `/login`.
- Em 401 após uma sessão carregada, expõe `sessionExpired = true`; manual logout limpa esse flag.
- Expõe `sessionExpired` e `clearSessionExpired` para a UI no `/login`.
- Quando faltarem no máximo 24h para a expiração efetiva (rolling ou absoluta), exibe um toast intermitente de aviso.
>>>>>>> 85291fa44ec6efa4184ecfea2c3957060dc56652
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
