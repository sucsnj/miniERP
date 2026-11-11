# `src/components/products/ProductPriceSection.tsx`

> Seção de preços, margem, venda e estoque do formulário de produto.

## O que faz

- Renderiza os campos de compra, margem (%), venda e estoque.
- Recalcula preço/margem em tempo real via `parseNumber`, `calculateSalePrice` e `calculateMargin`.
- Em edição, o estoque vira botão "Ajustar" que abre o `StockAdjustModal`.

## Relações

- **Usa:** `src/utils/number.ts`, `src/utils/productPrice.ts`.
- **Usado por:** [ProductForm](./ProductForm.md).

## Notas

- Apresentacional: apenas renderiza e chama `setForm`.
