# `src/pages/settings.tsx`

> Página dedicada de configurações do aplicativo.

## O que faz

- Exibe as preferências do aplicativo.
- Permite alterar o tema (`system`, `light`, `dark`) via `useThemeMode`.
- Permite ativar/desativar o foco automático no campo de venda e escolher o delay, em segundos (desabilitado quando o foco automático está desativado).
- Permite preencher os dados obrigatórios do PIX (`pixKey`, `pixName`, `pixBank`, `pixCity`) e limpá-los (campos e `localStorage`).

## Relações

- **Usa:** `src/contexts/ThemeContext.tsx`, componentes comuns de layout.
- **Acessada por:** link de configurações na [Nav](../components/common/Nav.md).

## Notas

- Novas funções de configuração serão adicionadas gradualmente nesta página.
