# `src/database/supabase.ts`

> Cliente Supabase exclusivo do servidor (API routes), com service role e sessão desabilitada.

## O que faz

- `getSupabaseServerClient()` cria (uma vez) e reutiliza o cliente `@supabase/supabase-js`.
- Usa `getSupabaseServerEnv()` para validar `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
- Configura `auth.persistSession=false`, `autoRefreshToken=false` e `detectSessionInUrl=false`.

## Relações

- **Usa:** `@supabase/supabase-js`, `server-only`, `src/utils/env.ts`.
- **Usado por:** repositories/API routes da Fase 3 (vendas, catálogo, contas/notas, tabela, consolidação).

## Notas

- A service role ignora RLS; nunca importar este módulo no browser (`server-only` barra o build).
- O schema ainda não foi aplicado no Dashboard; o client só será exercitado na Fase 3.
