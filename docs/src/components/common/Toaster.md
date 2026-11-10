# `src/components/common/Toaster.tsx`

> Host global de notificações; renderiza o toast ativo do store.

## O que faz

- Lê `useToast` (store `src/utils/toast.ts`) e renderiza o [Toast](./Toast.md) em `top-right`.
- Deve ser montado uma única vez (`src/pages/_app.tsx`).

## Relações

- **Usa:** [Toast](./Toast.md), `useToast` (`src/hooks/useToast.ts`), store `src/utils/toast.ts`.
- **Usado por:** `_app.tsx` (uma instância global).

## Notas

- `Toast` (componente) e `Toaster` (host) são distintos: o primeiro é visual, o segundo conecta o store.
- `useToast` usa `useSyncExternalStore`; sem toast em SSR (evita mismatch de hidratação).
