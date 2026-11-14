# `src/database/settingsRepository.ts`

> Repositório server-side de `company_settings`.

## O que faz

- `getCompanySettings(ctx)`: busca/cria configuração da empresa (inclui presets PIX e auto consolidação).
- `updateCompanySettings(patch, ctx)`: atualiza apenas campos informados e retorna o estado atual.
- `normalizePixPresets`: valida/serializa presets (`id`, `label` opcional, `pixKey`, `pixName`, `pixBank`, `pixCity`), no máximo 20.
- `upsertPixPreset`/`deletePixPreset` executam funções RPC (`upsert_pix_preset`/`delete_pix_preset`) para operação atômica sob lock.
- `auto_consolidation_mode` é `all-previous` (padrão) ou `previous-month`, com constraint.
- `field_scale_date`, `field_scale_value` e `field_scale_observations` são `1.2`, `1.5`, `2.0` ou `2.5`, por padrão `1.2`.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/serverAuth.ts`.
- **Usado por:** `src/pages/api/settings.ts`.

## Notas

- Filtro obrigatório por `ctx.companyId`.
- `pix_presets` é JSON shared (`jsonb`) no `company_settings`.
- PIX atual é apresentado separadamente (`pix_key`, `pix_name`, `pix_bank`, `pix_city`); presets são metadados para preenchimento rápido.
