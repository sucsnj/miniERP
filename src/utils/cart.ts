/**
 * src/utils/cart.ts
 *
 * Funções puras do carrinho de vendas (fonte única — usadas por useCart e
 * pelos modais de carrinho/seleção; ver docs/utils/Utils.md).
 */

import type { CartItem } from '../types/sale';

export interface CartSummary {
  totalItems: number;
  totalValue: number;
}

/** Soma de quantidades e de valor (preço × quantidade) do carrinho. */
export function getCartSummary(cartItems: CartItem[]): CartSummary {
  let totalItems = 0;
  let totalValue = 0;
  for (const item of cartItems) {
    totalItems += item.quantidade;
    totalValue += (item.preco_venda ?? 0) * item.quantidade;
  }
  return { totalItems, totalValue };
}