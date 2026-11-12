# `src/contexts/ThemeContext.tsx`

> Aplica `data-theme` conforme o tema efetivo de `SettingsContext`.

## O que faz

- Lê `themeMode` efetivo (override local ou padrão da empresa).
- Aplica/remove `data-theme` em `document.documentElement`.
- Mantém `useThemeMode()` como alias de compatibilidade.

## Relações

- **Usa:** `src/contexts/SettingsContext.tsx`.
- **Usado por:** `/settings`, navegação.
