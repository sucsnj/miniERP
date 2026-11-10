# `src/utils/cart.ts`

> Fonte única do resumo do carrinho de vendas.

## O que faz

- `getCartSummary(cartItems)` retorna `{ totalItems, totalValue }`.
- `totalItems` = soma de `quantidade`; `totalValue` = soma de `preco_venda × quantidade`.
- Trata `preco_venda` nulo/indefinido com fallback `0`.

```ts
getCartSummary(cartItems: CartItem[]): CartSummary
```

## Relações

- **Usa:** tipo `CartItem` (`../types/sale.ts`).
- **Usado por:** `useCart` e modais de carrinho (`CartModal`, `SelectItemsModal`, `CartModalShell`).

## Notas

- Puro e determinístico; extraído de `.reduce` duplicados nos modais.
