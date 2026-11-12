# `src/components/auth/AuthGate.tsx`

> Gate client-side para rotas autenticadas.

## O que faz

- Permite `/login` e `/setup` sem sessão.
- Enquanto `loading`, renderiza `PageSkeleton`.
- Sem usuário autenticado, redireciona para `/login`.
- Com usuário, renderiza os filhos dentro de um `Fragment key={user.storeId}`, para remontar as páginas ao trocar de loja.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), Next Router.
- **Usado por:** `src/pages/_app.tsx`.

## Notas

- Não substitui checagens server-side; é apenas UX/redirecionamento.
