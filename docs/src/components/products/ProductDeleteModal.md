# `src/components/products/ProductDeleteModal.tsx`

> Confirmação de exclusão de item do catálogo.

## O que faz

- Confirma a exclusão do item, avisando que a ação é irreversível e remove os códigos de barras.
- Delega a UI ao [ConfirmDialog](../common/ConfirmDialog.md), com variante `danger`.
- `if (!open || !item) return null;`.

```ts
interface ProductDeleteModalProps {
  open: boolean; item: ItemData | null; onConfirm: () => void; onClose: () => void;
}
```

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `ItemData` (`src/services/produtosService.ts`).
- **Usado por:** [cadastro](../../pages/cadastro.md) e [produtos](../../pages/produtos.md).

## Notas

- As variantes de exclusão dos cadastros auxiliares foram removidas; esses fluxos usam o `CatalogEntityModal` + `ConfirmDialog`.
