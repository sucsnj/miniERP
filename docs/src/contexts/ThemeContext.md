# `src/contexts/ThemeContext.tsx`

> Contexto global de tema do aplicativo.

## O que faz

- Mantém o modo de tema (`system`, `light`, `dark`).
- Lê a preferência salva em `localStorage['themeMode']` após a montagem.
- Aplica `data-theme` em `document.documentElement` e persiste a escolha.

## Relações

- **Usado por:** [Nav](../components/common/Nav.md), [settings](../pages/settings.md).

## Notas

- Estado inicial consistente (`system`) para evitar mismatch de hidratação; leitura do `localStorage` ocorre em efeito.
