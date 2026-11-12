# `src/database/settingsRepository.ts`

> Repositório server-side de `company_settings`.

## O que faz

- `getCompanySettings(ctx)`: busca/cria configuração da empresa.
- `updateCompanySettings(patch, ctx)`: atualiza apenas campos informados e retorna o estado atual.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/serverAuth.ts`.
- **Usado por:** `src/pages/api/settings.ts`.

## Notas

- Filtro obrigatório por `ctx.companyId`.
