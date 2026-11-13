# `src/pages/api/auth/bootstrap.ts`

> Bootstrap autenticado de novo tenant de admin/empresa.

## O que faz

- `GET`: informa `{ available: true }` quando `PIN_MASTER` está configurado.
- `POST`: valida `PIN_MASTER`, política de login/senha, cria empresa/loja/settings/admin/seed atomicamente via RPC `bootstrap_company_admin` e abre sessão de 2 dias.

## Relações

- **Usa:** `getSupabaseServerClient`, `hashPassword`, `validateLogin`, `validatePassword`, `createSession`, `setSessionCookie`, `verifyMasterPin`.
- **Usado por:** `src/pages/login.tsx`.

## Notas

- Primeira instalação (ou instalação ainda sem usuário) reivindica o tenant legado existente.
- Depois disso, cada bootstrap cria uma nova empresa/loja/admin/seeds.
