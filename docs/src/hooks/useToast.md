# `src/hooks/useToast.ts`

> Hook que expõe estado e controles de notificações (toast) a partir do store singleton.

## O que faz

- Usa `useSyncExternalStore` com `subscribeToast`, `getToastSnapshot`, `getServerToastSnapshot` para ler estado global.
- Retorna: `toastOpen`, `toastMessage`, `toastType` (`'success'|'error'|'info'`), `toastDuration` (ms, `null` = permanece), `showToast`, `closeToast` (`dismissToast`).
- Fonte única de toasts; componente `<Toaster/>` único em `_app`.

## Relações

- **Usa:** `dismissToast`, `getServerToastSnapshot`, `getToastSnapshot`, `showToast`, `subscribeToast` (`src/utils/toast.ts`).
- **Usado por:** páginas/componentes que precisam exibir notificações.

## Notas

- Robusto em SSR (snapshot servidor retorna estado inicial sem toast).
- Funções exportadas do módulo são estáveis (seguras como deps de `useCallback`).