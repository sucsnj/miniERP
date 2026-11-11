# `src/components/products/ProductList.tsx`

> Tabela paginada do catálogo (produtos + serviços) com ações.

## O que faz

- Colunas: Tipo, Cód. Interno, Nome (+descrição truncada), Preço, Estoque e Status (produto).
- Ações: ativar/desativar (produto), editar e excluir; `id`s por item (`edit-item-<id>` etc.).
- Paginação visível quando `totalPages > 1`; estados loading/vazio.

```ts
interface ProductListProps {
  items: ItemData[]; loading: boolean;
  onEdit(item: ItemData): void; onDelete(item: ItemData): void;
  onToggleStatus(item: ItemData): void;
  total: number; page: number; totalPages: number;
  onPageChange(page: number): void;
}
```

## Relações

- **Usa:** `ItemData` (`src/services/productsService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `products.module.css`, ícones MUI.
- **Usado por:** `../../pages/products.md`.

## Notas

- Sem estado; filtros/paginação vêm do pai (paginação client-side).
- Estoque do produto = `estoque_total` ou `estoque × multiplicador`.
