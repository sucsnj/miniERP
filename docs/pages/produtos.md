# `src/pages/produtos.tsx`

## Descrição

Página de **listagem** de produtos e serviços do catálogo, com filtros, busca, paginação e controle de status ativo/inativo. Navega para `/cadastro` para criar/editar itens.

## Contexto

Rota `/produtos`. É a porta de entrada do domínio Produtos/Estoque: exibe o catálogo combinado (produtos + serviços), permite pré-filtrar (`/produtos?search=1`) e leva ao cadastro/edição via FAB "+".

## Responsabilidades

- Exibir galeria/tabela de produtos e serviços combinados (ordenados por nome).
- Filtros (Filtros): busca por texto, tipo (PRODUTO/SERVICO/TODOS), categoria, marca, fornecedor e status (ATIVO/INATIVO/TODOS).
- Paginação (local: `pageSizeSafe` = 10 por página sobre o total carregado).
- Alternar status Ativo/Inativo de produtos (`toggleStatusProduto`).
- Excluir item com confirmação (`ModalProdExclusao`), tratando serviço vs. produto.
- Redirecionar para `/cadastro?id=X` quando editar.
- Notificações via `Toast`.

## Funções principais

- `carregarAuxiliares()` — carrega categorias, marcas, fornecedores e unidades de medida (para os dropdowns de filtro).
- `carregarItens()` — busca `buscarProdutos` e `buscarServicos` (com `pageSize: 10000`), mescla, ordena e pagina localmente (<10 páginas).
- `handleSearchSubmit(e)` / `handleLimparFiltros()` — aplica/limpa a busca.
- `handleEditarClick(item)` — `router.push('/cadastro?id=' + item.id)`.
- `handleToggleStatus(item)` — alterna `ativo` 0/1 e recarrega.
- `handleConfirmExcluir()` — exclui serviço/produto e ajusta página se vazia.

## Serviços/Componentes/Hooks

- `produtosService`: `buscarProdutos`, `buscarServicos`, `excluirProduto`, `excluirServico`, `toggleStatusProduto`, `buscarCategorias`, `buscarMarcas`, `buscarFornecedores`, `buscarUnidadesMedida`.
- Componentes: `ProdutosList`, `Filtros`, `ModalProdExclusao`, `Toast`.
- Não usa hooks de catálogo (`useCategoria` etc. são da página `/cadastro`).

## Estado

- `items`, `total`, `page`, `totalPages`, `loading` — listagem/paginação.
- `searchQuery`, `state` (`FiltrosState`) — busca/filtros.
- `options` (`ProdutoOptions`) — dados auxiliares dos dropdowns.
- `deleteConfirmOpen`, `itemParaExcluir` — modal de exclusão.
- Toast: `toastOpen`, `toastMessage`, `toastType`.

## Observações

- Serviços não têm marca/fornecedor/unidade: ao mesclar, a página usa defaults (`marca_id: 1`, `fornecedor_id: 1`, `unidade_medida_id: 21`, `estoque: 0`).
- A paginação real acontece no cliente — a API devolve até 10.000 itens (desempenho pode degradar com catálogo grande).
- `toggleStatus` só é aplicado para produtos (serviços não têm coluna `ativo`).
- Após excluir o único item da última página, volta uma página.
- FAB "+" (`.fab`) aponta para `/cadastro`.