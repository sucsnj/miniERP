# `src/pages/settings.tsx`

> Página dedicada de configurações do aplicativo.

## O que faz

- Exibe o padrão da empresa (`company_settings`) e overrides locais por dispositivo.
- Admin altera tema, fuso horário, histórico recente, foco automático/delay e PIX da empresa.
- Merchant visualiza os padrões da empresa e pode usar overrides locais (tema, fuso, recentes, foco/delay).
- PIX da empresa é compartilhado, editável apenas por admin; merchant pode gerar QR, mas não alterar dados PIX.
- Ao salvar um formulário PIX completo, a página guarda/atualiza um preset compartilhado (`pix_presets`) para preenchimento rápido.
- "Preenchimento rápido" apenas preenche o formulário; o PIX atual só muda ao clicar em Salvar PIX.
- "Limpar dados PIX" zera o PIX vigente e os campos do formulário explicitamente (inclui autofill do browser via `autoComplete="off"`), sem apagar presets.

## Relações

- **Usa:** `src/contexts/SettingsContext.tsx`, `src/services/settingsService.ts`, `src/contexts/ThemeContext.tsx`, `src/contexts/AuthContext.tsx`, componentes comuns de layout.
- **Acessada por:** link de configurações na [Nav](../components/common/Nav.md).

## Notas

- Novas funções de configuração serão adicionadas gradualmente nesta página.
