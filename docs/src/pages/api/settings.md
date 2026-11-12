# `src/pages/api/settings.ts`

> Configurações compartilhadas da empresa atual.

## O que faz

- `GET`: retorna `company_settings` do tenant (cria default se ainda não existir).
- `PATCH` (admin-only): atualiza tema, timezone, recentes, foco automático/delay e PIX da empresa; valida enums/intervalos.

## Relações

- **Usa:** `requireApiAuth`, `requireAdminApi`, `src/database/settingsRepository.ts`.
- **Usado por:** `src/contexts/SettingsContext.tsx`.

## Notas

- Merchant lê padrões da empresa, mas não altera PIX nem configurações compartilhadas.
