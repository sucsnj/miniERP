# `src/pages/api/settings/pix-presets.ts`

> Operações atômicas de presets PIX da empresa.

## O que faz

- `POST`: valida e insere/atualiza um preset PIX somente dentro de uma função SQL com lock na linha (`upsert_pix_preset`).
- `DELETE`: remove somente o preset informado, também sob lock (`delete_pix_preset`).
- Retorna `{ companySettings }` atualizado.

## Relações

- **Usa:** `requireAdminApi`, `normalizePixPresets`, `upsertPixPreset`, `deletePixPreset` (`database/settingsRepository.ts`).
- **Usado por:** `src/services/settingsService.ts`.

## Notas

- O endpoint rejeita payloads malformados de preset.
- O limite de 20 presets é aplicado dentro da função SQL; tentar excedê-lo gera erro explícito.
- Não aceita atualização em massa de `pixPresets`; a edição de PIX atual segue no `PATCH /api/settings`.
