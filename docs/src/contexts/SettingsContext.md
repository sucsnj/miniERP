# `src/contexts/SettingsContext.tsx`

> Contexto global de configurações do aplicativo.

## O que faz

- Mantém `companySettings` como padrão da empresa (`GET /api/settings`) via TanStack Query.
- Exibe overrides locais por dispositivo (`localStorage`) para tema, timezone, recentes e foco automático/delay.
- Precedência: `localStorage` válido → `company_settings` → default do app.
- Mantém dados PIX da empresa (`pixKey`, `pixName`, `pixBank`, `pixCity`) e presets compartilhados (`pixPresets`); não há override local.
- `patchCompanySettings` atualiza `company_settings` via TanStack Query mutation; `clearPixData()` limpa o PIX vigente, mas preserva presets.
- Carrega `company_settings` em segundo plano (stale-while-revalidate), não bloqueia o carregamento da rota.
- Persiste overrides locais, cache de `timezoneCompany` e cookie `timezone` efetivo.

## Relações

- **Usa:** `src/services/settingsService.ts`, `tenantKeys`/`identityFromUser` (`src/utils/queryKeys.ts`), `src/contexts/AuthContext.tsx`, `src/utils/storage.ts`.
- **Usado por:** `ThemeContext`, `/settings`, dashboard, formulários/hooks de vendas.

## Notas

- A ordem dos providers passou a ser `QueryClientProvider` → `AuthProvider` → `SettingsProvider`.
- Estado inicial consistente para evitar mismatch de hidratação; leitura de `localStorage` e query ocorre em efeito.
- Overrides locais antigos PIX são removidos na inicialização.
