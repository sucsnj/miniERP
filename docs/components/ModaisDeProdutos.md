# Modais de Produtos

> **Este documento foi consolidado em [ModaisCadastro.md](ModaisCadastro.md).**

Os modais de cadastro do catálogo — categorias, marcas, fornecedores e unidades de medida (criar/editar/excluir), importação de itens via NF-e, seleção de itens para o carrinho, modal de serviços e confirmações de exclusão — estão documentados em `docs/components/ModaisCadastro.md` (válido a partir da leitura do código no bloco Produtos/Estoque). Este arquivo é mantido apenas como ponte de navegação.

Resumo rápido:

- CRUD (criar/editar): `ModalCategoria`, `ModalCategoriaEdit`, `ModalMarca`, `ModalMarcaEdit`, `ModalFornecedor`, `ModalFornecedorEdit`, `ModalUnidadeMedida`, `ModalUnidadeMedidaEdit`.
- Importação/outros: `ModalImportItens`, `ModalServicos`, `ModalSelecionarItens`.
- Confirmação de exclusão: `ModalProdExclusao` + `ModalCatExclusao`, `ModalMarcaExclusao`, `ModalFornecedorExclusao`, `ModalUomExclusao`.

Ver também `docs/hooks/Hooks.md` (padrão comum dos hooks de catálogo) e `docs/pages/cadastro.md`.