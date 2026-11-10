# `src/types/sale.ts`

> Tipos compartilhados do domínio de vendas/carrinho usados por formulários, modais e hook de carrinho.

## O que faz

- `CatalogItemType`: `'PRODUTO' | 'SERVICO'`.
- `CartItem`: item do carrinho (`id`, `tipo`, `nome`, `preco_venda`, `quantidade`, `codigo_interno?`, `referencia?`, `estoque?`).

## Relações

- **Usa:** nenhum tipo externo além dos primitivos.
- **Usado por:** `src/hooks/useCart.ts`, `src/components/sales/DailySaleForm.tsx`, `src/components/sales/EditSaleForm.tsx`, `src/components/cart/CartModal.tsx`, `src/components/cart/SelectItemsModal.tsx`.

## Notas

- Tipos mínimos e focados no carrinho; mantidos alinhados ao uso atual.