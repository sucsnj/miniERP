# `src/components/FormularioItem.tsx`

## Descrição

Componente wrapper do formulário de cadastro/edição de itens do catálogo. Alterna entre `FormularioProduto` e `FormularioServico` conforme `form.tipo` e adiciona a área de importação de XML NF-e (arrastar/soltar ou clique).

## Contexto

Usado na página `/produtos` (bloco Produtos/Estoque) no topo do formulário de cadastro/edição. Os fields `options` e `actions` são compartilhados entre produto e serviço.

## Responsabilidades

- Renderizar o seletor de tipo (`PRODUTO` | `SERVICO`).
- Exibir a dropzone de importação de XML NF-e (drag & drop, clique ou tecla Enter).
- Delegar o formulário propriamente dito a `FormularioProduto` ou `FormularioServico`.

## Assinatura

```ts
interface FormularioItemProps {
  onImportXML: (file?: File) => void;
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

- `onImportXML` - recebe o arquivo XML selecionado/soltado para importação.
- `editarProdutoId` - id em edição (`null` para novo item).
- `form` - estado do formulário (`ProdutoFormData`).
- `setForm` - atualizador do estado do formulário.
- `options` - dados auxiliares do catálogo (categorias, marcas, fornecedores, unidades, etc.).
- `actions` - callbacks de modal do catálogo (abrir/editar categoria, etc.).
- `inputRef` - ref para o campo de nome/foco inicial.

## Dependências

- `FormularioProduto`, `FormularioServico`.
- `styles/produtos.module.css`, `styles/modalImport.module.css`.
- Ícone MUI (`ImportExportIcon`).

## Observações

- O input de arquivo aceita apenas `.xml`.
- O dropzone possui `role="button"` e `tabIndex={0}` (acessível por teclado).
- O tipo selecionado troca o formulário exibido sem recarregar a página.