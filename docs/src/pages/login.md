# `src/pages/login.tsx`

> Página de login do aplicativo.

## O que faz

- Permite entrar com `login` ou `email` + senha.
- Chama `useAuth().login`; mostra erro da API em caso de credenciais inválidas/limite.
- Redireciona para `/` quando já autenticado.

## Relações

- **Usa:** `src/contexts/AuthContext.tsx`, `src/components/common/Button.tsx`.
- **Usado por:** rota `/login`.
