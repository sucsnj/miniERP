# `src/pages/login.tsx`

> Página de autenticação do aplicativo (`/login`).

## O que faz

- Modo **Entrar**: autentica com `login` ou `email` + senha.
- Modo **Criar conta**: disponível apenas enquanto não há usuários; cria o primeiro admin/empresa/loja/settings via `POST /api/auth/bootstrap` e autentica automaticamente.
- Formulário de criação exige `PIN_MASTER`, empresa, primeira loja, nome, login, e-mail e senha.
- Redireciona para `/` quando já autenticado.

## Relações

- **Usa:** `src/contexts/AuthContext.tsx`, `src/components/common/Button.tsx`, `POST /api/auth/bootstrap`.
- **Usado por:** rota `/login`.
