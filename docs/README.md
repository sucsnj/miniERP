# Documentação do Projeto

Este arquivo é o ponto de partida para navegar pela documentação do projeto. Aqui você encontra os principais documentos já existentes em `docs/` e em `docs/pages/api/`, organizados por categoria para facilitar o acesso.

## Para agentes de IA

- [CONTEXT.md](CONTEXT.md) - guia de contexto rápido para agentes (evita releitura de código).
- [ALIGNMENT.md](ALIGNMENT.md) - domínio do negócio, usuários, fluxos e pontos de atenção para a refatoração.
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - estado atual do projeto: últimas mudanças, pendentes e futuras.
- [DOCS.md](DOCS.md) - documento de arquitetura geral do projeto, fluxo de dados, dependências críticas, riscos e sugestões de melhoria.
- [adr/](adr/) - Decisões de Arquitetura (ADRs) do projeto.
- [glossary.md](glossary.md) - glossário de termos do domínio.

## Sumário

- [Visão Geral](#visão-geral)
- [Páginas do Frontend](#páginas-do-frontend)
- [Referência de API](#referência-de-api)
- [Serviços](#serviços)
- [Banco de Dados](#banco-de-dados)
- [Componentes](#componentes)
- [Hooks](#hooks)
- [Tipos](#tipos)
- [Utilitários](#utilitários)
- [Glossário](#glossário)

## Visão Geral

- [DOCS.md](DOCS.md) - arquitetura geral, fluxo de dados, dependências críticas, riscos e melhorias.
- [CONTEXT.md](CONTEXT.md) - guia rápido para agentes: camadas, bancos, páginas e "tema → documentos".
- [ALIGNMENT.md](ALIGNMENT.md) - guia de alinhamento: negócio, usuários, fluxos e pontos de atenção para a refatoração.
- [adr/0001-documentacao-do-codigo.md](adr/0001-documentacao-do-codigo.md) - ADR: documentação do código por blocos.
- [adr/0002-padrao-de-validacao-de-campos.md](adr/0002-padrao-de-validacao-de-campos.md) - ADR: padrão de validação de campos `{ ok, message }`.

## Páginas do Frontend

- [pages/index.md](pages/index.md) - dashboard de vendas: resumo mensal, formulário, edição e backup.
- [pages/produtos.md](pages/produtos.md) - catálogo, estoque e preços de produtos.
- [pages/cadastro.md](pages/cadastro.md) - cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida).
- [pages/contas-a-pagar.md](pages/contas-a-pagar.md) - contas a pagar: filtros, importação de XML e pagamentos.
- [pages/historico.md](pages/historico.md) - histórico de vendas, listagem e busca.
- [pages/resumo.md](pages/resumo.md) - resumo mensal de vendas e totais consolidados.
- [pages/tabela.md](pages/tabela.md) - upload e consulta da tabela de medicamentos.
- [pages/_app.md](pages/_app.md) - configuração global do app e integração com React Query.

## Referência de API

### Backup

- [pages/api/backup.md](pages/api/backup.md) - backup do banco de dados principal.
- [pages/api/contas-backup.md](pages/api/contas-backup.md) - backup das contas a pagar.

### Financeiro

- [pages/api/vendas.md](pages/api/vendas.md) - CRUD de vendas diárias.
- [pages/api/venda-itens.md](pages/api/venda-itens.md) - itens de venda (carrinho).
- [pages/api/notas.md](pages/api/notas.md) - consulta de notas fiscais.
- [pages/api/mensais.md](pages/api/mensais.md) - relatórios de vendas mensais.
- [pages/api/contas.md](pages/api/contas.md) - CRUD de contas a pagar (listar, criar, pagar, cancelar, atualizar, excluir).

### Produtos e Estoque

- [pages/api/produtos.md](pages/api/produtos.md) - CRUD de produtos (catálogo).
- [pages/api/produtos/categorias.md](pages/api/produtos/categorias.md) - categorias.
- [pages/api/produtos/marcas.md](pages/api/produtos/marcas.md) - marcas.
- [pages/api/produtos/fornecedores.md](pages/api/produtos/fornecedores.md) - fornecedores.
- [pages/api/produtos/unidades-medida.md](pages/api/produtos/unidades-medida.md) - unidades de medida.
- [pages/api/produtos/itens.md](pages/api/produtos/itens.md) - itens de produto.
- [pages/api/produtos/servicos.md](pages/api/produtos/servicos.md) - serviços.
- [pages/api/produtos/movimentacoes.md](pages/api/produtos/movimentacoes.md) - movimentações de estoque.

### Importação e OCR

- [pages/api/ocr.md](pages/api/ocr.md) - upload e processamento OCR.
- [pages/api/tabela.md](pages/api/tabela.md) - upload, busca com cache e histórico da tabela de medicamentos.
- [pages/api/contas-import.md](pages/api/contas-import.md) - importação de contas via XML.

## Serviços

- [services/contasService.md](services/contasService.md) - API cliente de contas a pagar.
- [services/notasService.md](services/notasService.md) - API cliente de notas fiscais.
- [services/ocrService.md](services/ocrService.md) - OCR e upload de arquivos.
- [services/pdfService.md](services/pdfService.md) - conversão de PDF em imagem e pré-processamento para OCR.
- [services/produtosService.md](services/produtosService.md) - API cliente de produtos/catálogo.
- [services/tabelaService.md](services/tabelaService.md) - API cliente da tabela de medicamentos (upload, busca, histórico, status).
- [services/vendasService.md](services/vendasService.md) - API cliente de vendas diárias.

## Banco de Dados

- [database/db.md](database/db.md) - configuração e backup do banco SQLite de vendas (`vendas.db`).
- [database/contasDb.md](database/contasDb.md) - persistência de contas a pagar.
- [database/notasDb.md](database/notasDb.md) - persistência de notas fiscais.
- [database/tabelaDb.md](database/tabelaDb.md) - persistência do histórico/cache de buscas da tabela de medicamentos.
- [database/produtosDb.md](database/produtosDb.md) - catálogo e estoque em `produtos.db`.
- [database/seeds.md](database/seeds.md) - dados iniciais/sementes dos bancos.

## Componentes

### Vendas e Dashboard

- [components/DailySaleForm.md](components/DailySaleForm.md) - formulário de venda diária.
- [components/EditSaleForm.md](components/EditSaleForm.md) - edição de venda existente.
- [components/FormularioItem.md](components/FormularioItem.md) - formulário de item de venda.
- [components/FormularioServico.md](components/FormularioServico.md) - formulário de serviço.
- [components/ModalCarrinho.md](components/ModalCarrinho.md) - carrinho de compras da venda.
- [components/DailySalesTotal.md](components/DailySalesTotal.md) - totais do dia.
- [components/SalesChart.md](components/SalesChart.md) - gráfico de vendas.
- [components/SalesTable.md](components/SalesTable.md) - tabela de vendas.
- [components/ConsolidacaoMensal.md](components/ConsolidacaoMensal.md) - consolidação mensal.
- [components/Resumo.md](components/Resumo.md) - resumo de vendas.
- [components/NotasDoMes.md](components/NotasDoMes.md) - notas do mês.
- [components/TotaisPorDistribuidora.md](components/TotaisPorDistribuidora.md) - totais por distribuidora.
- [components/ExportButtons.md](components/ExportButtons.md) - exportação de dados.

### Contas a Pagar

- [components/ContasAPagarForm.md](components/ContasAPagarForm.md) - formulário de contas.
- [components/ContasAPagarFilterPanel.md](components/ContasAPagarFilterPanel.md) - painel de filtros.
- [components/ContasAPagarLastTen.md](components/ContasAPagarLastTen.md) - últimas 10 contas.
- [components/ContasAPagarModals.md](components/ContasAPagarModals.md) - modais de contas.
- [components/ContasAPagarHeader.md](components/ContasAPagarHeader.md) - cabeçalho do módulo.

### Produtos e Estoque

- [components/ProdutosList.md](components/ProdutosList.md) - listagem de produtos.
- [components/FormularioProduto.md](components/FormularioProduto.md) - formulário de produto.
- [components/ModaisDeProdutos.md](components/ModaisDeProdutos.md) - ponte para modais de produtos/cadastro (consolidado em `ModaisCadastro.md`).
- [components/ModaisCadastro.md](components/ModaisCadastro.md) - modais de cadastro (categorias, marcas, fornecedores, unidades, importação).
- [components/ModalAjusteEstoque.md](components/ModalAjusteEstoque.md) - ajuste de estoque.

### PIX e Pagamento

- [components/Pix.md](components/Pix.md) - fluxo de PIX: `ActionPix`, `FloatingPixWindow`, `FormPix`, `ModalPix`, `QrPix`.

### Gerais e Relatórios

- [components/Agenda.md](components/Agenda.md) - agenda de contas pendentes, próximas contas e leitura por OCR.
- [components/ConfirmDialog.md](components/ConfirmDialog.md) - modal de confirmação.
- [components/Nav.md](components/Nav.md) - navegação global.
- [components/OcrUpload.md](components/OcrUpload.md) - upload OCR.
- [components/Filtros.md](components/Filtros.md) - filtros de listagens.
- [components/Toast.md](components/Toast.md) - notificações.
- [components/BarcodeManager.md](components/BarcodeManager.md) - leitura de código de barras.

## Hooks

- [hooks/Hooks.md](hooks/Hooks.md) - hooks de estado: `useCart`, `useToast`, `useConfirmDialog`, `useVendas`, `useMensais`, `useFiltro`, `useCategoria`, `useMarca`, `useFornecedor`, `useUnidadeMedida`.

## Tipos

- [types/Types.md](types/Types.md) - tipos compartilhados (`categoria.ts`).

## Utilitários

- [utils/Utils.md](utils/Utils.md) - formatação, parsing e limpeza de dados.

## Glossário

- [glossary.md](glossary.md) - termos do domínio por área (Vendas, PIX, Cadastro/Catálogo, Contas).

## Como usar este índice

1. Comece por `CONTEXT.md` (guia rápido) e `DOCS.md` para entender a arquitetura geral.
2. Acesse as páginas do frontend para entender cada rota principal.
3. Consulte a seção de API para detalhes dos endpoints internos.
4. Use as seções de serviços, banco de dados, componentes, hooks e tipos para entender a implementação por camada.
5. Ao adicionar um doc novo, inclua-o aqui.