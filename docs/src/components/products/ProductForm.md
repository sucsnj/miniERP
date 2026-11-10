# `src/components/products/ProductForm.tsx`

> Formulário de cadastro/edição de produto; **exporta os tipos-chave do domínio**.

## O que faz

- Campos: Ativo, Nome, Descrição, Categoria/Marca/Fornecedor (select + "+" e "⋮"), preços/margem/estoque e unidades.
- Cálculo em tempo real de preço/margem (`parseNumber`, `calculateSalePrice`/`calculateMargin`).
- Em edição, Estoque vira botão "Ajustar" ([StockAdjustModal](./StockAdjustModal.md)); Código Interno fica `disabled`.

```ts
export interface ProductFormData {
  type: 'PRODUTO' | 'SERVICO'; name: string; description: string;
  categoryId: number; brandId: number; supplierId: number;
  purchasePrice: string; profitMargin: string; salePrice: string;
  stock: string; unitMultiplier: string; unitOfMeasureId: number;
  internalCode: string; reference: string; durationMinutes: string; active: number;
  unitsOfMeasure: { unitOfMeasureId: number; unitMultiplier: string; isPrincipal: boolean }[];
}
// ProductOptions { categories, brands, suppliers, unitsOfMeasure }
// ProductActions: openCategoryModal/openBrandModal/openSupplierModal/openUnitOfMeasureModal/openStockAdjustModal; editCategory/editBrand/editSupplier/editUnitOfMeasure
```

## Relações

- **Usa:** `src/utils/productPrice.ts`, `productUnits.ts`, `number.ts`, `formatter.tsx`; [CatalogEntityModal](../catalog/CatalogEntityModal.md).
- **Usado por:** [ItemForm](./ItemForm.md), [ServiceForm](./ServiceForm.md) e hooks/páginas de catálogo.

## Notas

- Apresentacional: só renderiza e chama `setForm`; as regras de unidades vivem em `src/utils/productUnits.ts` (preço/margem viram número na validação).
