# `src/components/products/ItemForm.tsx`

> Wrapper do formulário de item: seletor de tipo, dropzone de XML e escolha do formulário.

## O que faz

- Seletor **Tipo** (`PRODUTO` | `SERVICO`) que alterna o formulário exibido.
- Dropzone de XML de NF-e (drag&drop, clique ou Enter) que chama `onImportXML(file)`.
- Delega para [ProductForm](./ProductForm.md) ou [ServiceForm](./ServiceForm.md).

```ts
interface ItemFormProps {
  onImportXML: (file?: File) => void;
  editingProductId: number | null;
  form: ProductFormData;
  setForm: Dispatch<SetStateAction<ProductFormData>>;
  options: ProductOptions;
  actions: ProductActions;
  inputRef: RefObject<HTMLInputElement | null>;
}
```

## Relações

- **Usa:** [ProductForm](./ProductForm.md), [ServiceForm](./ServiceForm.md), `produtos.module.css`, `modalImport.module.css`.
- **Usado por:** `../../pages/produtos.md`.

## Notas

- O input de arquivo aceita só `.xml`; a dropzone é acessível por teclado (`role="button"`).
