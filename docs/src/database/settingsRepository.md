# `src/database/settingsRepository.ts`

> Repositório server-side de `company_settings`.

## O que faz

- `getCompanySettings(ctx)`: busca/cria configuração da empresa (inclui presets PIX e auto consolidação).
- `updateCompanySettings(patch, ctx)`: atualiza apenas campos informados e retorna o estado atual.
- `normalizePixPresets`: valida/serializa presets (`id`, `label` opcional, `pixKey`, `pixName`, `pixBank`, `pixCity`), no máximo 20.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/serverAuth.ts`.
- **Usado por:** `src/pages/api/settings.ts`.

## Notas

- Filtro obrigatório por `ctx.companyId`.
- `pix_presets` é JSON shared (`jsonb`) no `company_settings`.
- PIX atual é apresentado separadamente (`pix_key`, `pix_name`, `pix_bank`, `pix_city`); presets são metadados para preenchimento rápido.
