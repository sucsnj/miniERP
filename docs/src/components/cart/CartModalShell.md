# `src/components/cart/CartModalShell.tsx`

> Casca visual compartilhada dos modais de carrinho (overlay, header, corpo, rodapé).

## O que faz

- Renderiza via `createPortal(document.body)`; retorna `null` se `!isOpen` ou em SSR.
- Fecha por ESC (`useEscClose`), clique no overlay e botões fechar/"Concluir"; mantém foco (`useFocusTrap`).
- Header com badge de itens; rodapé com slot esquerdo, total (`formatCurrency`) e "Concluir".

```ts
interface CartModalShellProps {
  isOpen: boolean; onClose: () => void;
  titleId: string; title: string; icon: React.ReactNode; closeAriaLabel: string;
  summary: CartSummary; footerLeft?: React.ReactNode; children: React.ReactNode;
}
```

## Relações

- **Usa:** `useFocusTrap` (`src/utils/focus.tsx`), `useEscClose` (`src/hooks/useEscClose.ts`), `formatCurrency`, `CartSummary` (`src/utils/cart.ts`).
- **Usado por:** [CartModal](./CartModal.md), [SelectItemsModal](./SelectItemsModal.md).

## Notas

- Fonte única do chrome (`cart-modal-*` em `legacy.css`); antes duplicado nos dois modais.
- Só um shell fica aberto por vez (seleção ⇄ gerenciamento são exclusivos no `useCart`).
