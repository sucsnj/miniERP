# `src/pages/cadastro.tsx`

## Descrição

Página de **cadastro e edição** de produtos e serviços, com formulário completo (múltiplos códigos de barras, unidades de medida alternativas), modais auxiliares, importação de XML NF-e, ajuste de estoque e guarda de alterações não salvas.

## Contexto

Rota `/cadastro`. Dois fluxos de entrada:
- **Novo:** acessada diretamente ou com query de cadastro rápido (`?novoImport=1&nome=&precoCompra=&estoque=&unidade=&ean=&codigoInterno=`).
- **Edição:** `/cadastro?id=X` (vem da listagem `/produtos`).

## Responsabilidades

- Exibir formulário de cadastro/edição (Produto ou Serviço conforme `form.tipo`).
- Suporte a múltiplos códigos de barras (adicionar, remover, definir principal) via `BarcodeManager`.
- Salvar/atualizar produto (`registrarProduto`/`atualizarProduto`) ou serviço (`registrarServico`/`atualizarServico`).
- Modais de CRUD auxiliar: categoria, marca, fornecedor, unidade de medida (criar/editar; via hooks `useCategoria`, `useMarca`, `useFornecedor`, `useUnidadeMedida`).
- Ajuste de estoque com histórico (`ModalAjusteEstoque` + `buscarMovimentacoesEstoque`).
- Importação de XML NF-e (`ModalImportItens` + `onImportXML` de `FormularioItem`).
- Exclusão do item com confirmação (`ModalProdExclusao`).
- Guarda de alterações não salvas (dialog + `beforeunload`).

## Funções principais

- `carregarAuxiliares()` — categorias, marcas, fornecedores, unidades de medida.
- `carregarItemParaEdicao(id)` — busca produto+serviço, encontra por id e chama `preencherFormComItem`.
- `preencherFormComItem(item)` — popula `form` (inclui `unidadesMedida` para produtos) e `formCodigosBarras`.
- `resetForm()` — volta ao estado de novo cadastro e faz `router.replace('/cadastro')` (shallow).
- `handleAddBarcode` / `handleRemoveBarcode` / `handleSetPrincipalBarcode` — gestão de códigos de barras.
- `handleSubmitForm(e)` — valida, monta `payload` (produto) ou `servicePayload` (serviço) e salva; redireciona p/ `/produtos` em 2s.
- `handleConfirmExcluir()` — exclui item e reseta formulário.
- `carregarMovimentacoes(itemId)` — últimos 10 registros de estoque do item.
- Guard: `handleRouteChangeStart` (intercepta navegação se `isDirty`), dialog `ConfirmDialog` "Descartar alterações?".

## Serviços/Componentes/Hooks

- `produtosService`: buscar/registrar/atualizar/excluir produto e serviço; `buscarCategorias`/`Marcas`/`Fornecedores`/`UnidadesMedida`; `buscarMovimentacoesEstoque`.
- Componentes: `FormularioItem`, `BarcodeManager`, `ModalCategoria(Edit)`, `ModalMarca(Edit)`, `ModalFornecedor(Edit)`, `ModalUnidadeMedida(Edit)`, `ModalAjusteEstoque`, `ModalImportItens`, `ModalProdExclusao`, `Toast`, `ConfirmDialog`.
- Hooks: `useCategoria`, `useMarca`, `useFornecedor`, `useUnidadeMedida`.

## Estado (resumo)

- `form` (`ProdutoFormData`) — dados do item; `editingId` (null = novo).
- `formCodigosBarras`, `novoCodigoBarras` — códigos de barras.
- `modalAjusteOpen`, `ajusteQuantidade`, `ajusteDescricao`, `movimentacoesEstoque`, `movimentacoesLoading`.
- `modalImportOpen`, `importFile` — importação XML.
- `isDirty`, `discardDialogOpen`, `pendingNavUrl`, `skipDirtyGuard` — guard de alterações.
- `deleteConfirmOpen`, `itemParaExcluir`.

## Observações

- **Provider de edição carregado via query:** `?id=X` busca na listagem completa (pageSize 10000) — busca fria por item único inexistente.
- **Cadastro rápido via XML** preenche o formulário com `preco_venda = preco_compra × 1,5` e margem 50% (mesma regra do importador).
- Ajuste de estoque no formulário **não persiste imediatamente**: soma no campo `estoque` e alerta para "Salvar Alterações" (a movimentação AJUSTE é gravada no PUT da API).
- Arquivos XML caem no `ModalImportItens` via `onImportXML` (dropzone de `FormularioItem`).
- O guard usa o padrão Pages Router (`throw` + `routeChangeError`) para abortar navegações; mensagens nativas via `beforeunload`.