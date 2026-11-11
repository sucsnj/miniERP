# `src/pages/api/auth/bootstrap.ts`

> Bootstrap do primeiro admin/empresa.

## O que faz

- `GET`: informa `{ available: boolean }`, `true` apenas quando não há usuários.
- `POST`: valida `PIN_MASTER`, política de login/senha, cria empresa/loja/settings/admin/seed atomicamente via RPC `bootstrap_company_admin` e abre sessão de 2 dias.

## Relações

- **Usa:** `src/utils/password.ts`, `src/utils/serverAuth.ts`, `src/database/supabase.ts`.
- **Usado por:** página `/setup`.

## Notas

- Após existir qualquer usuário, `POST` retorna `403`.
- O PIN_MASTER é comparado com hash + `timingSafeEqual`.
