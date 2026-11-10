# Modais de Cadastro (Catálogo)

Documenta os modais auxiliares do catálogo: CRUD de categorias/marcas/fornecedores/unidades de medida, importação de itens via NF-e, seleção de itens para o carrinho, modal de serviços e confirmações de exclusão.

## Contexto

São abertos pela página `/cadastro` (formulário de produto) e usam `src/styles/produtos.module.css` (`modalOverlay`/`modalContent`) + `useFocusTrap`. A maioria é **controlada**: só é montada quando a condição correspondente é verdadeira (Estado em `useCategoria`/`useMarca`/`useFornecedor`/`useUnidadeMedida`).

---

## Cadastros com CRUD (criar + editar)

Cada entidade tem um par de modais: criação (campos obrigatórios marcados com `*`) e edição (adiciona o botão "Excluir" e embute o modal de confirmação de exclusão correspondente). O fluxo de dados é idêntico e está detalhado em `docs/hooks/Hooks.md` (padrão comum dos hooks de catálogo).

### `ModalCategoria` / `ModalCategoriaEdit` — `src/components/ModalCategoria.tsx` / `ModalCategoriaEdit.tsx`

- Criação: campos **Nome** (obrigatório) e **Descrição**; `useFocusTrap(dialogRef, true)`.
- Props (criação): `{ catForm, setCatForm, options }` onde `options` é `CategoriaOptions` (`{ abrirModalCategoria, salvarCategoria }`) — **tipos de `src/types/categoria.ts`**.
- Edição: props `{ catForm, setCatForm, onDelete, options }`; ao confirmar exclusão chama `onDelete`, fecha, e `options.abrirModalCategoria()` fecha o modal de edição. Embute `ModalCatExclusao`.
- Botão "Fechar" reseta `catForm` (`{ nome: '', descricao: '' }`), mas **chama `abrirModalCategoria()`** (inverte o estado de abertura — ver Observações).

### `ModalMarca` / `ModalMarcaEdit` — `src/components/ModalMarca.tsx` / `ModalMarcaEdit.tsx`

- Criação: campo **Nome** (obrigatório). Props: `{ setModalMarcaOpen, novaMarcaNome, setNovaMarcaNome, handleSalvarMarca }` (diferente do padrão de categoria/uom — recebe setters/handler diretamente).
- Edição: props `{ marcaForm, setMarcaForm, onDelete, options }`. Exporta `MarcaFormData` (`{ nome }`) e `MarcaOptions` (`{ abrirModalMarca, salvarMarca }`). Embute `ModalMarcaExclusao`.

### `ModalFornecedor` / `ModalFornecedorEdit` — `src/components/ModalFornecedor.tsx` / `ModalFornecedorEdit.tsx`

- Criação: campo **Nome** (obrigatório). Props: `{ setModalFornecedorOpen, novoFornecedorNome, setNovoFornecedorNome, handleSalvarFornecedor }`.
- Edição: props `{ fornecedorForm, setFornecedorForm, onDelete, options }`. Exporta `FornecedorFormData` e `FornecedorOptions`. Embute `ModalFornecedorExclusao`.

### `ModalUnidadeMedida` / `ModalUnidadeMedidaEdit` — `src/components/ModalUnidadeMedida.tsx` / `ModalUnidadeMedidaEdit.tsx`

- Criação: campos **Sigla** (obrigatório) e **Descrição**. Props: `{ uomForm, setUomForm, options }` com `options` = `UnidadeMedidaOptions` (`{ abrirModalUnidadeMedida, salvarUnidadeMedida }`).
- Edição: props `{ uomForm, setUomForm, onDelete, options }`. Exporta `UnidadeMedidaFormData` (`{ sigla, descricao }`) e `UnidadeMedidaOptions`. Embute `ModalUomExclusao`.

---

## `src/components/ModalImportItens.tsx`

Importação de **produtos via XML de NF-e** (endpoint `POST /api/produtos/itens`).

### Props

```ts
interface ModalImportItensProps {
    onClose: () => void;
    onImportSuccess: () => void;   // chamado ao concluir a importação (recarrega listagens)
    initialFile?: File | null;     // arquivo já informado (ex.: dropzone do FormularioItem)
}
```

### Comportamento

- Upload via **drag & drop** ou clique (aceita `.xml`). Ao soltar, dispara `processarArquivo` (para `initialFile`, roda via `useEffect` ao montar).
- Preview: `POST /api/produtos/itens` com `{ xml, preview: true }` → lista de `ProdutoImportado` com status `idle`.
- Cada linha tem `ItemNomeDropdown` (autocomplete com **debounce de 250ms**, busca `buscarProdutos` + `buscarServicos`, 8 resultados cada) para **vincular** o item da NF-e a um item existente.
- Ações por linha: "Cadastro rápido" (abre `/cadastro?novoImport=1&nome=&precoCompra=&estoque=&unidade=&ean=&codigoInterno=` em nova aba) ou, se vincular a item existente, "Editar item" (`/cadastro?id=X`).
- Importação: itera os itens fazendo `POST` com `{ importar: true, produto }`; status final por item: `ok` | `duplicado` | `estoque_atualizado` | `erro`. Ao final, `onImportSuccess()` e banner com resumo.

### Tipos

```ts
interface ProdutoImportado {
    cProd?: string; ean: string; descricao: string; descricaoOriginal?: string;
    unidadeMedida: string; quantidade: number; valorUnitario: number;
    ncm?: string; cfop?: string; existe?: boolean; itemIdExistente?: number;
}
type StatusItem = 'idle' | 'ok' | 'duplicado' | 'estoque_atualizado' | 'erro';
```

### Observações

- Só aceita arquivos `.xml`; erro claro caso contrário.
- Durante a importação os dropdowns são desabilitados; botão "Trocar arquivo" reseta o estado.
- Botão "Importar N produto(s)" fica oculto após concluído (vira "Fechar").

---

## `src/components/ModalSelecionarItens.tsx`

Seleção de itens do catálogo para o **carrinho de venda** (`ModalCarrinho`), usado pelo `useCart`.

### Props

```ts
interface ModalSelecionarItensProps {
    isOpen: boolean;
    onClose: () => void;
    onManageCart: () => void;                 // abre o gerenciador do carrinho
    cartItems: CartItem[];                    // tipo de DailySaleForm
    catalogItems: ItemData[];
    loadingCatalog: boolean;
    cartSearch: string;
    onCartSearchChange: (value: string) => void;
    onAddToCart: (item: ItemData) => void;
    onRemoveFromCart: (item: ItemData) => void;
}
```

### Comportamento

- Renderizado via `createPortal(document.body)`; overlay fecha clicando fora; **ESC fecha**; foco automático na busca (50ms após abrir).
- Busca com botão "✕" para limpar; clicar no item adiciona (com `+qtd` badge quando já no carrinho); botão "−" subtrai (desabilitado se não está no carrinho).
- Rodapé: badge de total de itens, botão **Gerenciar** (se carrinho não-vazio) e **Total** + botão Concluir.
- Estilos via `<style jsx>` internos (não usa CSS module).

---

## `src/components/ModalServicos.tsx`

Modal de **criação, edição e exclusão de serviços** (CRUD completo autossuficiente).

### Props

```ts
interface ModalServicosProps {
    isOpen: boolean;
    onClose: () => void;
    servicos?: ServicoData | null;  // presente = edição; ausente = novo
    onSave: (servico: ServicoData) => void;
}
```

### Comportamento

- Formulário: **Nome** (obrigatório), **Descrição**, **Categoria** (select carregado de `buscarCategorias`), **Preço de venda**, **Código interno**, **Referência**, **Duração (minutos)**.
- Ao abrir em edição busca o serviço atualizado via `buscarServicoPorId`; limpa estado de erro.
- Salvar: `registrarServico` (novo) ou `atualizarServico` (edição), depois `onSave(saved)` e fecha.
- Excluir: botão "Excluir" (só em edição) → `excluirServico` e fecha.
- Campos `categoria_id`, `preco_venda` e `duracao_minutos` são convertidos para `Number` no submit.
- Estilos inline (não usa `modalOverlay`/`modalContent` padrão) + `styles.panelHeader`/`formGroup`.

---

## `src/components/ModalProdExclusao.tsx`

Modal de **confirmação de exclusão**. Exporta o default `ModalProdExclusao` (item do catálogo) e variantes nomeadas usadas pelos modais de cadastro.

### Props

```ts
// Default (item do catálogo — produtos/serviços)
interface ModalProdExclusaoProps {
    open: boolean;
    item: ItemData | null;            // null não renderiza nada
    onConfirm: () => void;
    onClose: () => void;
}

// Variantes nomeadas (categoria, marca, fornecedor, unidade de medida)
ModalCatExclusao:      { open; categoria: { nome, descricao? }; onConfirm; onClose }
ModalMarcaExclusao:    { open; marca: { nome }; onConfirm; onClose }
ModalFornecedorExclusao:{ open; fornecedor: { nome }; onConfirm; onClose }
ModalUomExclusao:      { open; unidadeMedida: { sigla, descricao? }; onConfirm; onClose }
```

### Comportamento

- `if (!open) return null;` (o `item`/entidade só para a mensagem).
- Mensagem de advertência (exclusão irreversível, remove códigos de barras associados) no default.
- Botões "Excluir" (destacado em `var(--danger)`) e "Cancelar".
- As variantes são embutidas em `ModalCategoriaEdit`, `ModalMarcaEdit`, `ModalFornecedorEdit` e `ModalUnidadeMedidaEdit`.

---

## Observações

- Os modais de criação de **categoria e unidade de medida** recebem `options.salvar*` (handler vindo do hook) como `onSubmit`; os de **marca e fornecedor** recebem o handler direto como prop.
- O botão "Fechar" dos modais de criação de categoria/uom chama `abrirModalCategoria()`/`abrirModalUnidadeMedida()` — no fluxo real isso **inverte** a abertura; pairar o estado do modal no pai evita comportamento divergente.
- `ModalCategoria`/`ModalCategoriaEdit` usam tipos de `src/types/categoria.ts` (`CategoriaFormData`, `CategoriaOptions`).
- Todos usam `useFocusTrap` com o ref do diálogo.