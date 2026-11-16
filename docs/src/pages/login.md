# `src/pages/login.tsx`

> Página de autenticação do aplicativo (`/login`).

## O que faz

- Modo **Entrar**: autentica com `login` ou `email` + senha.
- Quando a sessão expira enquanto o app está aberto, `/login` exibe um balão flutuante persistente ("Sessão expirada") com botão "Entendi"; só some após confirmação.
- Modo **Criar conta**: cria um admin/empresa/loja/settings via `POST /api/auth/bootstrap`, autenticado com `PIN_MASTER` e autenticação automática.
- O formulário de bootstrap cria empresa/loja/company_settings e seeds padrão; primeiro bootstrap reivindica tenant legado, próximos geram novo tenant.

## Relações

- **Usa:** `src/contexts/AuthContext.tsx`, `src/components/common/Button.tsx`, `POST /api/auth/bootstrap`.
- **Usado por:** rota `/login`.

## Notas

- O bootstrap não exige instalação vazia; apenas `PIN_MASTER` e dados válidos da nova empresa.
