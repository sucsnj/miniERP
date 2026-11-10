# Hooks (`src/hooks/`)

## Descrição

Hooks de estado do cliente, usados pelas páginas e componentes do app.

## Hooks

### `useToast` — `useToast.ts`

Gerencia notificações (Toast).

- Estado: `toastOpen`, `toastMessage`, `toastType` (`'success' | 'error' | 'info'`, default `'info'`), `toastDuration` (ms, default 3000; `null` = permanece aberto).
- Ações: `showToast(message, type?, duration?)`, `closeToast()`.

### `useConfirmDialog` — `useConfirmDialog.ts`

Gerencia o diálogo de confirmação de exclusão.

- Parâmetro: `onConfirmAction(id)` — ação executada ao confirmar.
- Estado: `confirmOpen`, `selectedId`.
- Ações: `openConfirm(id)`, `handleConfirm()` (executa a ação e fecha), `cancelConfirm()`.

### `useVendas` — `useVendas.ts`

Concentra o estado de vendas e suas ações.

- Parâmetros: `(mes, ano, showToast, options?)`.
- `UseVendasOptions`: `{ filtro?: 'todas'|'positivas'|'negativas' (default 'positivas'), autoConsolidar?: boolean (default true) }`.
- Estado: `sales` (`VendaDiaria[]`), `editingSale` (`VendaDiaria | null`), `loading`.
- Ações: `loadSales()` (busca via `buscarVendasDiarias` e dispara `autoConsolidar`), `handleConsolidate()`, `handleBackup()`, `handleEditSale(sale)`, `handleCancelEdit()`, `handleSaved()` (fecha edição e recarrega), `handleDeleteSale(id)` (valida `canEdit` de `src/utils/edit`; mostra toasts apropriados).

### `useMensais` — `useMensais.ts`

Estado das consolidações mensais.

- Parâmetro: `showToast`.
- Estado: `mensais` (`VendaMensal[]`).
- Ações: `loadMensais()`, `handleDelete(id)` (exclui via `excluirMensal` e recarrega).

### `useCart` — `useCart.ts`

Centraliza o **carrinho de compras** e o catálogo de seleção (produtos + serviços).

- Parâmetro: `onToast?`.
- Estado: `cartItems` (`CartItem[]`, tipo de `DailySaleForm`), `selecionarOpen`, `cartModalOpen`, `cartSearch`, `catalogItems` (`ItemData[]`), `loadingCatalog`, `totalCartCount`, `totalCartValue`.
- Ações: `handleCartClick()` (abre seleção), `closeSelecao()`, `openCarrinho()`, `closeCarrinho()`, `handleManageCart()` (fecha seleção e abre carrinho), `handleAddToCart(item)` (+1, agrupa por id+tipo), `handleRemoveFromCart(item)` (−1; remove quando chega a 0), `handleUpdateQuantity(id, tipo, qty)` (remove se `qty <= 0`), `handleRemoveItem(id, tipo)`, `handleClearCart()`.
- Interno: `buscarItensCatalogo(query)` com **debounce de 250ms** enquanto o modal de seleção estiver aberto; busca produtos ativos e serviços via `produtosService` (máximo 50 cada) e mescla ordenado por nome.
- Observação: serviços são convertidos para `ItemData` com valores de catálogo padrão (unidade 21, marca 1, fornecedor 1, estoque 0).

### `useFiltro` — `useFiltro.ts`

Filtro do histórico de vendas (página `/historico`), persistido no localStorage.

- Exporta o tipo `FiltroVendas` = `'todas' | 'positivas' | 'negativas'`.
- Retorna `{ filtro, changeFiltro(value: FiltroVendas) }`.
- Estado inicial (lazy initializer, sem render extra): lê `localStorage['historicoFiltro']`; no servidor (SSR) e para valores inválidos usa `'todas'`.
- `changeFiltro` atualiza o estado e grava `localStorage['historicoFiltro']`.

### `useCategoria` — `useCategoria.ts`

CRUD de **categorias** usado na página `/cadastro` (cadastro rápido + edição + exclusão com confirmação).

- Parâmetros: `{ form, setForm, setOptions, showToast, carregarItens, items, page, setPage, setDeleteConfirmOpen, setItemParaExcluir }`.
- Estado: `modalCategoriaOpen`/`catForm` (cadastro rápido `{ nome, descricao }`), `modalCategoriaEditOpen` (edição).
- Ações: `handleSalvarCategoria(e)` (valida `nome`; cria via `criarCategoria`, recarrega `categorias` em `options` e seleciona em `form.categoriaId`), `handleOpenEditModal(categoria)` (pré-seleciona e abre edição), `handleAtualizarCategoria(e)` (via `atualizarCategoria(form.categoriaId, ...)` + atualiza `options` localmente e `carregarItens()`), `handleDeletarCategoria()` (via `deletarCategoria(form.categoriaId)`, remove de `options`, volta `categoriaId` para 1 e ajusta página/lista — mesmo padrão dos demais hooks).
- Observação: as mensagens vêm da API (`response.message`); o estado `itemParaExcluir`/`setDeleteConfirmOpen` pertence ao `ModalProdExclusao` compartilhado.

### `useMarca` — `useMarca.ts`

CRUD de **marcas** (mesmo padrão de `useCategoria`).

- Parâmetros originais: `{ form, setForm, setOptions, showToast, carregarItens, items, page, setPage, setDeleteConfirmOpen, setItemParaExcluir }`.
- Estado: `modalMarcaOpen`/`novaMarcaNome` (cadastro rápido), `marcaForm` (`{ nome }`, edição), `modalMarcaEditOpen`, `novaMarcaNome`.
- Ações: `handleSalvarMarca(e)`, `handleOpenEditMarcaModal(marca)`, `handleAtualizarMarca(e)`, `handleDeletarMarca()`.
- Ao deletar: `form.marcaId` volta para `1` (marca "Outros").

### `useFornecedor` — `useFornecedor.ts`

CRUD de **fornecedores** (mesmo padrão).

- Parâmetros originais: `{ form, setForm, setOptions, showToast, carregarItens, items, page, setPage, setDeleteConfirmOpen, setItemParaExcluir }`.
- Estado: `modalFornecedorOpen`/`novoFornecedorNome`, `fornecedorForm` (`{ nome }`), `modalFornecedorEditOpen`.
- Ações: `handleSalvarFornecedor(e)`, `handleOpenEditFornecedorModal(fornecedor)`, `handleAtualizarFornecedor(e)`, `handleDeletarFornecedor()`.
- Ao deletar: `form.fornecedorId` volta para `1` (fornecedor "Sem fornecedor").

### `useUnidadeMedida` — `useUnidadeMedida.ts`

CRUD de **unidades de medida** (mesmo padrão), com tipos próprios.

- Parâmetros originais: `{ form, setForm, setOptions, showToast, carregarItens, items, page, setPage, setDeleteConfirmOpen, setItemParaExcluir }`.
- Exporta `UnidadeMedidaFormData` (`{ sigla, descricao }`) e `UnidadeMedidaOptions` (`{ abrirModalUnidadeMedida, salvarUnidadeMedida }`).
- Estado: `modalUnidadeMedidaOpen`/`uomForm`, `modalUnidadeMedidaEditOpen`.
- Ações: `handleSalvarUnidadeMedida(e)` (valida `sigla`), `handleOpenEditUnidadeMedidaModal({ id, sigla, descricao? })`, `handleAtualizarUnidadeMedida(e)`, `handleDeletarUnidadeMedida()`.
- Ao deletar: `form.unidadeMedidaId` volta para `1` (unidade "UN").

### Padrão comum dos hooks de catálogo

Todos os quatro (`useCategoria`, `useMarca`, `useFornecedor`, `useUnidadeMedida`) seguem o mesmo fluxo:

1. Cadastro rápido abre modal, valida campo obrigatório, chama o `criar*`, recarrega a lista em `setOptions`, seleciona o novo `id` no formulário e fecha.
2. Edição preenche o modal a partir do item selecionado, chama o `atualizar*` (usando `form.<campo>Id`), reflete o nome atualizado em `options` e roda `carregarItens()`.
3. Exclusão chama o `deletar*`, remove o item de `options`, fecha o modal de confirmação (`setDeleteConfirmOpen(false)`) e redefine o id para `1`; se a lista tinha só 1 item em página > 1, volta uma página, senão recarrega.

## Observações

- Padrão geral: estado React local + chamadas a `src/services/*`; notificações são injetadas por `useToast`.