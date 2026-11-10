# `src/components/products/ProductFilters.tsx`

> Formulário de filtros da listagem de produtos/serviços.

## O que faz

- Filtros: Buscar, Tipo, Categoria, Marca, Fornecedor e Status.
- Trocar um select reseta a página (`actions.changePage(1)`); "Filtrar" submete e "Limpar" limpa.

```ts
export interface ProductFiltersState {
  search: string; type: 'PRODUTO' | 'SERVICO' | 'TODOS';
  categoryId: number | ''; brandId: number | ''; supplierId: number | '';
  status: 'ATIVO' | 'INATIVO' | 'TODOS';
}
interface ProductFiltersProps {
  state: ProductFiltersState; data: ProductFiltersData;
  setFilters: React.Dispatch<React.SetStateAction<ProductFiltersState>>;
  actions: ProductFiltersActions; // { search, clear, changePage }
}
```

## Relações

- **Usa:** `CategoryData`/`BrandData`/`SupplierData` (`src/services/produtosService.ts`), `produtos.module.css`.
- **Usado por:** `../../pages/produtos.md`.

## Notas

- Apresentacional; o estado dos filtros fica na página.
