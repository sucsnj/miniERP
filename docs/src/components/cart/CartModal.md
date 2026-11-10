# `src/components/cart/CartModal.tsx`

> Modal do carrinho de vendas: lista os itens com quantidade, subtotal e total.

## O que faz

- Apresentacional (sem estado): recebe `cartItems` e callbacks; o resumo vem de `getCartSummary`.
- Itens com badge de tipo, código interno, preço unitário, controles `−`/`+` (mínimo 1), subtotal e remover.
- Estado vazio (mensagem central) e rodapé com "Limpar Carrinho" (só com itens).

```ts
interface CartModalProps {
  isOpen: boolean; onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, tipo: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}
```

## Relações

- **Usa:** [CartModalShell](./CartModalShell.md), `getCartSummary` (`src/utils/cart.ts`), `formatCurrency`, `CartItem` (`src/types/sale.ts`).
- **Usado por:** `useCart` (`src/hooks/useCart.ts`) via [DailySaleForm](../sales/DailySaleForm.md) e [EditSaleForm](../sales/EditSaleForm.md).

## Notas

- O chrome (overlay/header/footer/total) é do `CartModalShell`; o `<style jsx>` local cobre só itens/quantidade/ações.
- Refatoração: removidos portal/ESC/focus-trap e o `<style jsx>` de chrome duplicado (global `cart-modal-*`).
