# `src/utils/toast.ts`

> Store singleton de notificações (toast) — fonte única de estado.

## O que faz

- `showToast(message, type?, duration?)` e `dismissToast()` alteram o estado e notificam os assinantes.
- `subscribeToast`/`getToastSnapshot`/`getServerToastSnapshot` alimentam o `useSyncExternalStore` do hook.

## Relações

- **Usado por:** `useToast`, host `common/Toaster` e chamadas diretas (ex.: `PixModal`).

## Notas

- `duration = null` mantém o toast aberto até o fechamento manual; nada é renderizado no SSR (ADR 0003).
