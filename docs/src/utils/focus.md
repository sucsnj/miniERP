# `src/utils/focus.tsx`

> Hook de focus trap para modais e diálogos.

## O que faz

- `useFocusTrap(dialogRef, open)` prende o foco (Tab/Shift+Tab) dentro do diálogo enquanto aberto.
- Foca o primeiro elemento focável e devolve o foco ao fechar; adiciona/remove `modal-open` no `body` (com contador para modais empilhados).

## Relações

- **Usado por:** modais de `cart`, `catalog`, `import`, `pix`, `payables` e `common/ConfirmDialog`.
