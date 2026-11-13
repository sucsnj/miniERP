# `src/pages/api/settings.ts`

> Configurações compartilhadas da empresa atual.

## O que faz

- `GET`: retorna `company_settings` do tenant (cria default se ainda não existir).
- `PATCH` (admin-only): atualiza tema, timezone, recentes, foco automático/delay, auto consolidação e PIX da empresa; valida enums/intervalos e rejeita patches com `pixPresets`.

## Relações

- **Usa:** `requireApiAuth`, `requireAdminApi`, `src/database/settingsRepository.ts`.
- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- Merchant lê padrões da empresa, mas não altera PIX nem configurações compartilhadas.
- `autoConsolidationDay` aceita apenas 1–28; `autoConsolidationEnabled` é boolean.
- `pixPresets` não é aceito: presets usam endpoints atômicos `/api/settings/pix-presets`.
- `clearPixData` no cliente limpa apenas o PIX vigente; presets ficam disponíveis.
