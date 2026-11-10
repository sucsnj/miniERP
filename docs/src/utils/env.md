# `src/utils/env.ts`

> Validação centralizada das variáveis de ambiente do servidor Supabase.

## O que faz

- `getSupabaseServerEnv()` retorna `{ url, serviceRoleKey }` com cache em memória.
- Falha com erro explícito quando `NEXT_PUBLIC_SUPABASE_URL` (URL http/https válida) ou `SUPABASE_SERVICE_ROLE_KEY` estão ausentes.

## Relações

- **Usa:** `server-only`.
- **Usado por:** `src/database/supabase.ts`.

## Notas

- Módulo somente servidor: importá-lo em código client quebra o build de propósito.
- Não registrar a service role em logs.
