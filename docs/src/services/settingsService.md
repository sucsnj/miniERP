# `src/services/settingsService.ts`

> Cliente HTTP via `fetch` para configurações do tenant.

## O que faz

- Define tipos `RecentSalesCount`, `ThemeMode`, `PixPreset`, `CompanySettings` e `CompanySettingsPatch`.
- `fetchCompanySettings()` (GET `/api/settings`).
- `patchCompanySettings(patch)` (PATCH `/api/settings`).
- `upsertPixPreset(preset)` / `deletePixPreset(id)` (endpoints atômicos `/api/settings/pix-presets`).
- `clearPixData()` (patch dos 4 campos PIX vazios; presets permanecem).
- `parseResponse`/`fetchJson` propaga `Error` em respostas não OK.

## Relações

- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- `PATCH` passa `credentials: 'same-origin'` para propagar o cookie de sessão.
- `clearPixData()` envia quatro campos vazios e limpa cache/recarrega via contexto; não limpa overrides locais.
