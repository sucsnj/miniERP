# `src/components/FormularioItem.tsx`

## Descrição

Componente wrapper do formulário de cadastro/edição de itens do catálogo. Alterna entre `FormularioProduto` e `FormularioServico` conforme `form.tipo`.

## Contexto

Usado na página `/products` (bloco Produtos/Estoque) no topo do formulário de cadastro/edição. Os fields `options` e `actions` são compartilhados entre produto e serviço.

## Responsabilidades

- Renderizar o seletor de tipo (`PRODUCT` | `SERVICE`).
- Delegar o formulário propriamente dito a `FormularioProduto` ou `FormularioServico`.

## Assinatura

```ts
interface FormularioItemProps {
  editarProdutoId: number | null;
  form: ProdutoFormData;
  setForm: Dispatch<SetStateAction<ProdutoFormData>>;
  options: ProdutoOptions;
  actions: ProdutoActions;
  inputRef: RefObject<HTMLInputElement | null>;
}

const FormularioItem: React.FC<FormularioItemProps>;
```

## Props

- `editarProdutoId` - id em edição (`null` para novo item).
- `form` - estado do formulário (`ProdutoFormData`).
- `setForm` - atualizador do estado do formulário.
- `options` - dados auxiliares do catálogo (categorias, marcas, fornecedores, unidades, etc.).
- `actions` - callbacks de modal do catálogo (abrir/editar categoria, etc.).
- `inputRef` - ref para o campo de nome/foco inicial.

## Dependências

- `FormularioProduto`, `FormularioServico`.
- `styles/products.module.css`.

## Observações

- O tipo selecionado troca o formulário exibido sem recarregar a página.
- A importação de XML de NF-e é feita em `/payables`.