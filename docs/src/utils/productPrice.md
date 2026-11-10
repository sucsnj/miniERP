# `src/utils/productPrice.ts`

> Cálculo de preço de venda e margem do catálogo.

## O que faz

- `calculateSalePrice(purchasePrice, marginPercent)` = preço de compra × (1 + margem%/100), com 2 casas.
- `calculateMargin(purchasePrice, salePrice)` = margem % a partir dos preços (requer `purchasePrice > 0`).

## Relações

- **Usa:** `formatCurrencyNumber` (`./formatter.md`).
- **Usado por:** `products/ProductForm`.

## Notas

- Regra de negócio fora do módulo de validação (ADR 0002); renomeado de `produtoPreco` (ADR 0004).
