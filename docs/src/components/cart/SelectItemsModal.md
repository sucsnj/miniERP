# `src/components/cart/SelectItemsModal.tsx`

> Modal de seleção do catálogo para adicionar itens ao carrinho.

## O que faz

- Apresentacional: busca (debounce no `useCart`) e soma vêm por props; clicar no item adiciona +1 e "−" subtrai 1.
- Badges de tipo/estoque/código interno e `+N` quando o item já está no carrinho.
- Foco automático na busca ao abrir (timeout 50ms); botão "Gerenciar" abre o [CartModal](./CartModal.md).

```ts
interface SelectItemsModalProps {
  isOpen: boolean; onClose: () => void; onManageCart: () => void;
  cartItems: CartItem[]; catalogItems: ItemData[]; loadingCatalog: boolean;
  cartSearch: string; onCartSearchChange: (value: string) => void;
  onAddToCart: (item: ItemData) => void; onRemoveFromCart: (item: ItemData) => void;
}
```

## Relações

- **Usa:** [CartModalShell](./CartModalShell.md), `getCartSummary` (`src/utils/cart.ts`), `ItemData` (`src/services/produtosService.ts`), `CartItem` (`src/types/sale.ts`).
- **Usado por:** `useCart` via [DailySaleForm](../sales/DailySaleForm.md) e [EditSaleForm](../sales/EditSaleForm.md).

## Notas

- Adiciona 1 unidade por clique; quantidades maiores pelo [CartModal](./CartModal.md).
- Chrome herdado do shell; `<style jsx>` local só para busca/catálogo.
