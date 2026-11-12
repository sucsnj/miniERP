# `src/components/auth/RequireAdmin.tsx`

> Gate client-side para áreas exclusivas de administradores.

## O que faz

- Enquanto a sessão carrega, renderiza `PageSkeleton`.
- Se `user.role !== 'admin'`, mostra "Apenas administradores".
- Caso contrário, renderiza os children.

## Relações

- **Usa:** `useAuth` (`src/contexts/AuthContext.tsx`), layout comum.
- **Usado por:** `src/pages/settings.tsx`, `src/pages/registration.tsx`.

## Notas

- Não substitui autorização server-side; é apenas UX.
