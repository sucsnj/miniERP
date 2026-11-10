# `src/hooks/useEscClose.ts`

> Hook para fechar modal/componente ao pressionar a tecla ESC enquanto aberto.

## O que faz

- Registra listener de `keydown` no `window` quando `isOpen` é `true`.
- Remove listener no cleanup quando fechado ou desmontado.
- Dispara `onClose()` apenas quando `event.key === 'Escape'`.

## Relações

- **Usa:** `React.useEffect`.
- **Usado por:** `src/components/cart/CartModalShell.tsx`.

## Notas

- Não bloqueia outros listeners de ESC na página; verifica apenas se `isOpen`.