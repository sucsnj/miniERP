# `src/components/products/ServiceForm.tsx`

> Formulário de cadastro/edição de serviço.

## O que faz

- Campos: Nome, Descrição, Categoria (com "+" e "⋮"), Preço Venda, Duração (min), Código Interno e Referência.
- Preço formatado no `onChange` (`parseNumber`/`formatCurrencyNumber`); Código Interno `disabled` em edição.

```ts
interface ServiceFormProps {
  editingProductId: number | null;
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  options: ProductOptions; actions: ProductActions;
  inputRef: React.RefObject<HTMLInputElement | null>;
}
```

## Relações

- **Usa:** tipos de [ProductForm](./ProductForm.md), `number.ts`, `formatter.tsx`, `produtos.module.css`.
- **Usado por:** [ItemForm](./ItemForm.md) quando `form.type === 'SERVICO'`.

## Notas

- Análogo ao `ProductForm`, mas com preço único e duração; `categoryId` cai para `1` se vazio.
