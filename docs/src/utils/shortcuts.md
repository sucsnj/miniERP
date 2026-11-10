# `src/utils/shortcuts.tsx`

> Hooks de atalhos de teclado globais.

## O que faz

- `useShortcuts(shortcuts, callback)` dispara o callback por `event.code` quando a tecla está na lista.
- `useShortcutsHandlers(handlers)` mapeia `event.key` para handlers individuais.

## Relações

- **Usado por:** `useDailySaleForm`, páginas `contas-a-pagar`/`tabela` e modais (`PayablesModals`, `ConfirmDialog`).
