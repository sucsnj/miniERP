# `src/pages/api/auth/login.ts`

> Login por `login` ou `email`.

## O que faz

- Valida identificador e senha.
- Aplica limite básico de tentativas por IP + identificador.
- Busca usuário por `login` ou `email`.
- Verifica senha com `scrypt`; exige usuário ativo.
- Escolhe loja: `last_store_id`, primeira ativa da empresa (admin) ou primeira loja autorizada (merchant).
- Cria sessão opaca de 48h e cookie `minierp_session`.

## Relações

- **Usa:** `src/utils/password.ts`, `src/utils/serverAuth.ts`, `src/utils/loginRateLimit.ts`, Supabase server client.
- **Usado por:** `src/contexts/AuthContext.tsx`.

## Notas

- Erros de credenciais são genéricos para não revelar se o usuário existe.
