# `src/components/FormularioServico.tsx`

## Descrição

Formulário de cadastro/edição de um serviço do catálogo. Exibe os campos de nome, descrição, categoria, preço de venda, duração em minutos, código interno e referência.

## Contexto

Renderizado por `FormularioItem` quando `form.tipo === 'SERVICO'` na página `/produtos`. É o análogo de `FormularioProduto` para serviços.

## Responsabilidades

- Capturar dados de serviço (nome, descrição, categoria).
- Capturar valor econômico (preço de venda com máscara de moeda).
- Capturar duração (minutos) e identificação (código interno, referência).
- Acionar modais de categoria (`abrirModalCategoria` / `editarCategoria`).

## Assinatura

```ts
interface FormularioServicoProps {
  editarProdutoId: number | null;
  form: ProdutoFormData;
  setForm: Dispatch<SetStateAction<ProdutoFormData>>;
  options: ProdutoOptions;
  actions: ProdutoActions;
  inputRef: RefObject<HTMLInputElement | null>;
}

const FormularioServico: React.FC<FormularioServicoProps>;
```

## Props

- `editarProdutoId` - id em edição (`null` para novo serviço).
- `form` - estado do formulário (`ProdutoFormData`, reutilizado entre produto e serviço).
- `setForm` - atualizador do estado do formulário.
- `options` - dados auxiliares (categorias).
- `actions` - callbacks de modal do catálogo (`abrirModalCategoria`, `editarCategoria`).
- `inputRef` - ref aplicada ao campo Nome.

## Dependências

- `styles/produtos.module.css`.
- `parseNumber` (`src/utils/number`) e `formatCurrencyNumber` (`src/utils/formatter`).
- Ícones MUI (`MoreVert`, `Add`).

## Observações

- O campo Preço de Venda valida `parseNumber` no onChange e só aplica o valor formatado se for número `>= 0`.
- O campo Código Interno fica `disabled` durante edição (`editarProdutoId` preenchido) — "Código Interno não pode ser alterado".
- Se o preço for deixado vazio/preenchido parcialmente, o texto digitado é mantido no estado (sem máscara agressiva).
- `categoriaId` cai para `1` quando o select está vazio.