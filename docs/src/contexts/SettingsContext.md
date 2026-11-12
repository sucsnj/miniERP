# `src/contexts/SettingsContext.tsx`

> Contexto global de configurações do aplicativo.

## O que faz

- Mantém `companySettings` como padrão da empresa (`GET /api/settings`).
- Expõe overrides locais por dispositivo (`localStorage`) para tema, timezone, recentes e foco automático/delay.
- Precedência: `localStorage` válido → `company_settings` → default do app.
- Mantém dados PIX da empresa (`pixKey`, `pixName`, `pixBank`, `pixCity`); não há override local.
- `patchCompanySettings` atualiza `company_settings` (admin); `clearPixData` limpa PIX da empresa.
- Carrega `company_settings` em segundo plano; não bloqueia o carregamento da rota.
- Persiste overrides locais, cache de `timezoneCompany` e cookie `timezone` efetivo.

## Relações

- **Usa:** `GET/PATCH /api/settings`, `src/utils/storage.ts`.
- **Usado por:** `ThemeContext`, `/settings`, dashboard, formulários/hooks de vendas.

## Notas

- Estado inicial consistente para evitar mismatch de hidratação; leitura de `localStorage` e `/api/settings` ocorre em efeito.
- Overrides locais antigos PIX são removidos na inicialização.
