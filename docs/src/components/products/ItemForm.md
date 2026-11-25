# `src/components/products/ItemForm.tsx`

> Wrapper do formulário de item: seletor de tipo e escolha do formulário.

## O que faz

- Seletor **Tipo** (`PRODUCT` | `SERVICE`) que alterna o formulário exibido.
- Delega para [ProductForm](./ProductForm.md) ou [ServiceForm](./ServiceForm.md).

```ts
interface ItemFormProps {
  editingProductId: string | null;
  form: ProductFormData;
  setForm: Dispatch<SetStateAction<ProductFormData>>;
  options: ProductOptions;
  actions: ProductActions;
  inputRef: RefObject<HTMLInputElement | null>;
}
```

## Relações

- **Usa:** [ProductForm](./ProductForm.md), [ServiceForm](./ServiceForm.md), `products.module.css`.
- **Usado por:** `../../pages/registration.md`.

## Notas

- A importação de XML de NF-e não faz mais parte deste formulário; ela é feita em `/payables`.
