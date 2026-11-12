# `src/pages/api/settings.ts`

> Configurações compartilhadas da empresa atual.

## O que faz

- `GET`: retorna `company_settings` do tenant (cria default se ainda não existir).
- `PATCH` (admin-only): atualiza tema, timezone, recentes, foco automático/delay, auto consolidação, PIX da empresa e presets PIX; valida enums/intervalos e normaliza `pixPresets`.

## Relações

- **Usa:** `requireApiAuth`, `requireAdminApi`, `src/database/settingsRepository.ts`.
- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- Merchant lê padrões da empresa, mas não altera PIX nem configurações compartilhadas.
- `autoConsolidationDay` aceita apenas 1–28; `autoConsolidationEnabled` é boolean.
- `pixPresets` exige no máximo 20 itens com `id` e quatro dados PIX completos; `label` é opcional.
- `clearPixData` no cliente limpa apenas o PIX vigente; presets ficam disponíveis.
