# `src/pages/api/settings.ts`

> Configurações compartilhadas da empresa atual.

## O que faz

- `GET`: retorna `{ companySettings, fieldScalesAvailable }`; antes da migration `0026`, usa fallback compatível e informa disponibilidade.
- PATCH (admin-only): atualiza tema, timezone, recentes, foco automático/delay, auto consolidação, ampliação dos campos e PIX da empresa; valida enums/intervalos e rejeita patches com `pixPresets`. Retorna também `fieldScalesAvailable`.
- Ampliação aceita `fieldScaleDate`, `fieldScaleValue` e `fieldScaleObservations` com valores `1`, `1.2`, `1.5`, `2` ou `2.5`.
- Auto consolidação aceita `autoConsolidationEnabled` (boolean), `autoConsolidationDay` (1–28) e `autoConsolidationMode` (`all-previous` ou `previous-month`).

## Relações

- **Usa:** `requireApiAuth`, `requireAdminApi`, `src/database/settingsRepository.ts`.
- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- Merchant lê padrões da empresa, mas não altera PIX nem configurações compartilhadas.
- `autoConsolidationDay` aceita apenas 1–28; `autoConsolidationMode` é `all-previous` ou `previous-month`.
- `pixPresets` não é aceito: presets usam endpoints atômicos `/api/settings/pix-presets`.
- `clearPixData` no cliente limpa apenas o PIX vigente; presets ficam disponíveis.
