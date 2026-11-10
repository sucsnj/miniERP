# `src/components/FormularioProduto.tsx`

## Descrição

Formulário de **cadastro/edição de produto**. É um componente **compartilhado** que também **exporta os tipos usados em todo o domínio** (`ProdutoFormData`, `ProdutoOptions`, `ProdutoActions`), importados por `FormularioItem`, `FormularioServico`, hooks e páginas.

## Contexto

Não é renderizado diretamente pelas páginas: `FormularioItem` escolhe entre `FormularioProduto` (quando `form.tipo === 'PRODUTO'`) e `FormularioServico` (quando `SERVICO`). Ao editar, a mesma tela é usada com `editarProdutoId` preenchido.

## Tipos exportados (chave do domínio)

```ts
export interface ProdutoFormData {
    tipo: 'PRODUTO' | 'SERVICO';
    nome: string; descricao: string;
    categoriaId: number; marcaId: number; fornecedorId: number;
    precoCompra: string; margemLucro: string; precoVenda: string;
    estoque: string; multiplicadorUnidade: string;
    unidadeMedidaId: number;
    codigoInterno: string; referencia: string;
    duracaoMinutos: string; ativo: number;
    unidadesMedida: { unidadeMedidaId: number; multiplicadorUnidade: string; principal: boolean }[];
}

export interface ProdutoOptions {
    categorias: CategoriaData[];
    marcas: MarcaData[];
    fornecedores: FornecedorData[];
    unidadesMedida: UnidadeMedidaData[];
}

export interface ProdutoActions {
    abrirModalCategoria: () => void;
    abrirModalMarca: () => void;
    abrirModalFornecedor: () => void;
    abrirModalUnidadeMedida: () => void;
    abrirModalAjusteEstoque: () => void;
    editarCategoria: (categoria: CategoriaData) => void;
    editarMarca: (marca: MarcaData) => void;
    editarFornecedor: (fornecedor: FornecedorData) => void;
    editarUnidadeMedida: (unidadeMedida: UnidadeMedidaData) => void;
}
```

> Nota: `precoCompra`, `margemLucro`, `precoVenda`, `estoque` e `multiplicadorUnidade` são **strings** (inputs livres); a conversão numérica acontece na validação/salvamento.

## Props

```ts
interface FormularioProdutoProps {
    editarProdutoId: number | null;   // null = novo; número = edição
    form: ProdutoFormData;
    setForm: React.Dispatch<React.SetStateAction<ProdutoFormData>>;
    options: ProdutoOptions;          // opções dos selects
    actions: ProdutoActions;          // aberturas de modais auxiliares
    inputRef: React.RefObject<HTMLInputElement | null>; // foco no campo Nome
}
```

## Comportamento/Responsabilidades

- **Ativo:** select Sim/Não (1/0).
- **Nome** (obrigatório, focado via `inputRef`) e **Descrição** (textarea).
- **Categoria / Marca / Fornecedor:** select com botão "+" (`abrirModal*`) e botão "⋮" (`editar*`) que abre o modal de edição do item **atualmente selecionado** no select (ou `1` se vazio).
- **Preço, margem e estoque** (cálculo em tempo real, via `parseNumber`/`formatCurrencyNumber`):
  - Digitar **Compra** → recalcula Venda usando a margem atual (`compra × (1 + margem/100)`); se margem inválida, recalcula margem a partir de venda/compra.
  - Digitar **Margem (%)** → recalcula Venda.
  - Digitar **Venda** → recalcula Margem a partir de compra/venda.
  - **Estoque:** em edição (`editarProdutoId`) vira um botão **"Ajustar"** que abre `ModalAjusteEstoque`; em cadastro novo é input numérico.
- **Unidades de Medida:** lista de linhas com radio de principal, select de unidade, multiplicador ("Fator") e botão remover (X). Ao remover a principal, a primeira restante vira principal e sincroniza `unidadeMedidaId`/`multiplicadorUnidade`. Botões "+ Nova Unidade" (default `{ unidadeMedidaId: 1, multiplicadorUnidade: '1', principal: !vazio }`) e "Cadastro de Unidades" (abre modal).
- **Código Interno:** desabilitado em edição (não pode ser alterado); placeholder avisa e menciona preenchimento automático quando em branco.
- **Referência.**

## Dependências

- `src/services/produtosService.ts` (tipos `CategoriaData`, `MarcaData`, `UnidadeMedidaData`, `FornecedorData`).
- `src/utils/number.ts` (`parseNumber`) e `src/utils/formatter.ts` (`formatCurrencyNumber`).
- `src/styles/produtos.module.css`; `@mui/icons-material` (`Add`, `MoreVert`, `Close`).

## Observações

- Componente de **apresentação controlada**: não busca dados nem salva; apenas renderiza o formulário e chama `setForm`.
- `ProdutoOptions`/`ProdutoFormData`/`ProdutoActions` servem de contrato para os modais e hooks de catálogo.
- Alterar a unidade principal, o fator da principal ou remover a principal sincroniza `form.unidadeMedidaId`/`form.multiplicadorUnidade` (campos "resumo" usados no payload).