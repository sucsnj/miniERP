/**
 * src/utils/productPrice.ts
 *
 * Sale price and profit margin calculations from the catalog
 * (business rule — outside the validation module, see ADR 0002).
 */

import { formatCurrencyNumber } from './formatter';

/**
 * Sale price from the purchase price and the profit margin (%).
 */
export function calculateSalePrice(purchasePrice: number, marginPercent: number): number {
  return formatCurrencyNumber(purchasePrice * (1 + marginPercent / 100), 2);
}

/**
 * Profit margin (%) from the purchase price and the sale price.
 * Requires `purchasePrice > 0` (guaranteed by the callers' handlers).
 */
export function calculateMargin(purchasePrice: number, salePrice: number): number {
  return formatCurrencyNumber((salePrice / purchasePrice - 1) * 100, 2);
}