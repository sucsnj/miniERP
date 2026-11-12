# `src/services/settingsService.ts`

> Cliente HTTP via `fetch` para configurações do tenant.

## O que faz

- Define tipos `RecentSalesCount`, `ThemeMode`, `CompanySettings` e `CompanySettingsPatch`.
- `fetchCompanySettings()` (GET `/api/settings`).
- `patchCompanySettings(patch)` (PATCH `/api/settings`).
- `clearPixData()` (patch dos 4 campos PIX vazios).
- `parseResponse`/`fetchJson` propaga `Error` em respostas não OK.

## Relações

- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- `PATCH` passa `credentials: 'same-origin'` para propagar o cookie de sessão.
- `clearPixData()` envia quatro campos vazios e limpa cache/recarrega via contexto; não limpa overrides locais.
