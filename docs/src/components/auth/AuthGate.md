# `src/components/auth/AuthGate.tsx`

> Gate client-side para rotas autenticadas.

## O que faz

- Permite `/login` e `/setup` sem sessão.
- Enquanto `loading`, mostra placeholder de carregamento.
- Sem usuário autenticado, redireciona para `/login`.
- Com usuário, renderiza os filhos.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), Next Router.
- **Usado por:** `src/pages/_app.tsx`.

## Notas

- Não substitui checagens server-side; é apenas UX/redirecionamento.
