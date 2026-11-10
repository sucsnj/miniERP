# Documentação do Projeto

Este arquivo é o ponto de partida para navegar pela documentação do projeto.

**Espelho de `src/`**: a documentação de código fica em `docs/src/`, replicando **exatamente** a estrutura de `src/` (mesmos nomes de arquivo e subpastas; um `.md` por arquivo-fonte). Ex.: `src/hooks/useCart.ts` → [src/hooks/useCart.md](src/hooks/useCart.md). Validado por `node scripts/check-docs.mjs`. O template único de doc está em [documentation-guidelines.md](documentation-guidelines.md).

## Para agentes de IA

- [CONTEXT.md](CONTEXT.md) - guia de contexto rápido para agentes (evita releitura de código).
- [ALIGNMENT.md](ALIGNMENT.md) - domínio do negócio, usuários, fluxos e pontos de atenção para a refatoração.
- [documentation-guidelines.md](documentation-guidelines.md) - padrão de documentação: espelho de `src/`, template único, o que registrar e onde (incl. ADRs e `PROJECT_STATUS`).
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - estado atual do projeto: pendentes e futuras (sem histórico).
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
- [adr/0003-padrao-de-notificacoes-toast.md](adr/0003-padrao-de-notificacoes-toast.md) - ADR: padrão de notificações (toast) — store singleton + host global.
- [adr/0004-padrao-de-nomenclatura-dos-identificadores.md](adr/0004-padrao-de-nomenclatura-dos-identificadores.md) - ADR: identificadores/funções/arquivos em inglês (pt-BR só em strings de UI).
- [adr/0005-agrupamento-de-componentes-por-dominio.md](adr/0005-agrupamento-de-componentes-por-dominio.md) - ADR: componentes em subpastas por domínio com nomes de arquivo em inglês.
- [adr/0006-docs-espelhando-src.md](adr/0006-docs-espelhando-src.md) - ADR: documentação espelhando `src/` em `docs/src/` + template único validado por script.
- [adr/0007-css-modules-e-design-tokens.md](adr/0007-css-modules-e-design-tokens.md) - ADR: CSS Modules, design tokens e tema por `data-theme`.
- [adr/0008-modais-de-catalogo-e-confirmacao-compartilhada.md](adr/0008-modais-de-catalogo-e-confirmacao-compartilhada.md) - ADR: modal genérico de catálogo e confirmação compartilhada.
- [adr/0009-padroes-de-layout-e-formularios.md](adr/0009-padroes-de-layout-e-formularios.md) - ADR: padrão de layout e formulários baseado em `/contas-a-pagar`.
- [adr/0010-sistema-de-botoes-com-variantes.md](adr/0010-sistema-de-botoes-com-variantes.md) - ADR:
- [adr/0011-integracao-carrinho-estoque.md](adr/0011-integracao-carrinho-estoque.md) - ADR: integração do carrinho com estoque (devolução explícita, quantidade inteira, estoque negativo configurável, backend-first). botões com variantes funcionais, tamanhos, carregamento e `iconOnly`.
- [adr/0012-migracao-sqlite-para-supabase.md](adr/0012-migracao-sqlite-para-supabase.md) - ADR: migração do SQLite local para Supabase/Postgres (schema public, UUID, RPC, nomenclatura inglesa ponta a ponta).

## Páginas do Frontend

- [src/pages/index.md](src/pages/index.md) - dashboard de vendas: resumo mensal, formulário, edição e backup.
- [src/pages/produtos.md](src/pages/produtos.md) - catálogo, estoque e preços de produtos.
- [src/pages/cadastro.md](src/pages/cadastro.md) - cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida).
- [src/pages/contas-a-pagar.md](src/pages/contas-a-pagar.md) - contas a pagar: filtros, importação de XML e pagamentos.
- [src/pages/historico.md](src/pages/historico.md) - histórico de vendas, listagem e busca.
- [src/pages/resumo.md](src/pages/resumo.md) - resumo mensal de vendas e totais consolidados.
- [src/pages/tabela.md](src/pages/tabela.md) - upload e consulta da tabela de medicamentos.
- [src/pages/_app.md](src/pages/_app.md) - configuração global do app, ordem do CSS e integração com React Query.
- [src/pages/_document.md](src/pages/_document.md) - documento HTML, idioma e aplicação do tema antes da hidratação.

## Referência de API

### Backup

- [src/pages/api/backup.md](src/pages/api/backup.md) - backup do banco de dados principal.
- [src/pages/api/contas/backup.md](src/pages/api/contas/backup.md) - backup das contas a pagar.

### Financeiro

- [src/pages/api/vendas.md](src/pages/api/vendas.md) - CRUD de vendas diárias.
- [src/pages/api/venda-itens.md](src/pages/api/venda-itens.md) - itens de venda (carrinho).
- [src/pages/api/notas.md](src/pages/api/notas.md) - consulta de notas fiscais.
- [src/pages/api/mensais.md](src/pages/api/mensais.md) - relatórios de vendas mensais.
- [src/pages/api/contas.md](src/pages/api/contas.md) - CRUD de contas a pagar (listar, criar, pagar, cancelar, atualizar, excluir).

### Produtos e Estoque

- [src/pages/api/produtos.md](src/pages/api/produtos.md) - CRUD de produtos (catálogo).
- [src/pages/api/produtos/categorias.md](src/pages/api/produtos/categorias.md) - categorias.
- [src/pages/api/produtos/marcas.md](src/pages/api/produtos/marcas.md) - marcas.
- [src/pages/api/produtos/fornecedores.md](src/pages/api/produtos/fornecedores.md) - fornecedores.
- [src/pages/api/produtos/unidades-medida.md](src/pages/api/produtos/unidades-medida.md) - unidades de medida.
- [src/pages/api/produtos/itens.md](src/pages/api/produtos/itens.md) - itens de produto.
- [src/pages/api/produtos/servicos.md](src/pages/api/produtos/servicos.md) - serviços.
- [src/pages/api/produtos/movimentacoes.md](src/pages/api/produtos/movimentacoes.md) - movimentações de estoque.

### Importação e OCR

- [src/pages/api/ocr.md](src/pages/api/ocr.md) - upload e processamento OCR.
- [src/pages/api/tabela.md](src/pages/api/tabela.md) - upload, busca com cache e histórico da tabela de medicamentos.
- [src/pages/api/contas/import.md](src/pages/api/contas/import.md) - importação de contas via XML.

## Serviços

- [src/services/contasService.md](src/services/contasService.md) - API cliente de contas a pagar.
- [src/services/notasService.md](src/services/notasService.md) - API cliente de notas fiscais.
- [src/services/ocrService.md](src/services/ocrService.md) - OCR e upload de arquivos.
- [src/services/pdfService.md](src/services/pdfService.md) - conversão de PDF em imagem e pré-processamento para OCR.
- [src/services/produtosService.md](src/services/produtosService.md) - API cliente de produtos/catálogo.
- [src/services/tabelaService.md](src/services/tabelaService.md) - API cliente da tabela de medicamentos (upload, busca, histórico, status).
- [src/services/vendasService.md](src/services/vendasService.md) - API cliente de vendas diárias.

## Banco de Dados

- [supabase.md](supabase.md) - guia do Supabase: aplicar schema, convenções, RPCs, segurança e Vercel.
- [src/database/supabase.md](src/database/supabase.md) - client server-only do Supabase (service role, sessão desabilitada).
- [src/database/db.md](src/database/db.md) - configuração e backup do banco SQLite de vendas (`vendas.db`).
- [src/database/contasDb.md](src/database/contasDb.md) - persistência de contas a pagar.
- [src/database/notasDb.md](src/database/notasDb.md) - persistência de notas fiscais.
- [src/database/tabelaDb.md](src/database/tabelaDb.md) - persistência do histórico/cache de buscas da tabela de medicamentos.
- [src/database/produtosDb.md](src/database/produtosDb.md) - catálogo e estoque em `produtos.db`.
- [src/database/seeds.md](src/database/seeds.md) - dados iniciais/sementes dos bancos.

## Componentes

> Estrutura espelhada de `src/components/`: `cart/`, `sales/`, `summary/`, `payables/`, `products/`, `catalog/`, `import/`, `pix/`, `common/` (ADR 0005).

### Vendas e Carrinho (`src/components/sales/`, `cart/`)

- [src/components/sales/DailySaleForm.md](src/components/sales/DailySaleForm.md) - formulário de venda diária.
- [src/components/sales/EditSaleForm.md](src/components/sales/EditSaleForm.md) - edição de venda existente.
- [src/components/sales/DailySalesTotal.md](src/components/sales/DailySalesTotal.md) - totais do dia.
- [src/components/sales/SalesChart.md](src/components/sales/SalesChart.md) - gráfico de vendas.
- [src/components/sales/SalesTable.md](src/components/sales/SalesTable.md) - tabela de vendas.
- [src/components/sales/ExportButtons.md](src/components/sales/ExportButtons.md) - exportação de dados.
- [src/components/cart/CartModal.md](src/components/cart/CartModal.md) - carrinho de compras da venda.
- [src/components/cart/CartModalShell.md](src/components/cart/CartModalShell.md) - casca compartilhada dos modais de carrinho.
- [src/components/cart/SelectItemsModal.md](src/components/cart/SelectItemsModal.md) - seleção de itens (catálogo) para adicionar ao carrinho.

### Resumo e Consolidação (`src/components/summary/`)

- [src/components/summary/Summary.md](src/components/summary/Summary.md) - resumo de vendas.
- [src/components/summary/MonthlyConsolidation.md](src/components/summary/MonthlyConsolidation.md) - consolidação mensal.
- [src/components/summary/MonthNotes.md](src/components/summary/MonthNotes.md) - notas do mês.
- [src/components/summary/TotalsByDistributor.md](src/components/summary/TotalsByDistributor.md) - totais por distribuidora.

### Contas a Pagar (`src/components/payables/`)

- [src/components/payables/PayablesForm.md](src/components/payables/PayablesForm.md) - formulário de contas.
- [src/components/payables/PayablesFilterPanel.md](src/components/payables/PayablesFilterPanel.md) - painel de filtros.
- [src/components/payables/PayablesLastTen.md](src/components/payables/PayablesLastTen.md) - últimas 10 contas.
- [src/components/payables/PayablesModals.md](src/components/payables/PayablesModals.md) - modais de contas.
- [src/components/payables/PayablesHeader.md](src/components/payables/PayablesHeader.md) - cabeçalho do módulo.
- [src/components/payables/Agenda.md](src/components/payables/Agenda.md) - agenda de contas pendentes, próximas contas e leitura por OCR.

### Produtos e Catálogo (`src/components/products/`, `catalog/`)

- [src/components/products/ProductList.md](src/components/products/ProductList.md) - listagem de produtos.
- [src/components/products/ProductForm.md](src/components/products/ProductForm.md) - formulário de produto.
- [src/components/products/ProductFilters.md](src/components/products/ProductFilters.md) - filtros de listagens.
- [src/components/products/ItemForm.md](src/components/products/ItemForm.md) - formulário de item de venda.
- [src/components/products/ServiceForm.md](src/components/products/ServiceForm.md) - formulário de serviço.
- [src/components/products/StockAdjustModal.md](src/components/products/StockAdjustModal.md) - ajuste de estoque.
- [src/components/products/ProductDeleteModal.md](src/components/products/ProductDeleteModal.md) - confirmação de exclusão de itens do catálogo.
- [src/components/catalog/CatalogEntityModal.md](src/components/catalog/CatalogEntityModal.md) - modal genérico de criação/edição/exclusão dos cadastros auxiliares.

### Importação (`src/components/import/`)

- [src/components/import/ImportItemsModal.md](src/components/import/ImportItemsModal.md) - importação de itens via XML de NF-e.
- [src/components/import/ItemNameDropdown.md](src/components/import/ItemNameDropdown.md) - busca de itens (produtos/serviços) com sugestões.
- [src/components/import/OcrUpload.md](src/components/import/OcrUpload.md) - upload para OCR.

### PIX (`src/components/pix/`)

- [src/components/pix/PixModal.md](src/components/pix/PixModal.md) - modal de pagamento via PIX.

### Gerais (`src/components/common/`)

- [src/components/common/Nav.md](src/components/common/Nav.md) - navegação global.
- [src/components/common/Toast.md](src/components/common/Toast.md) - componente de notificação.
- [src/components/common/Toaster.md](src/components/common/Toaster.md) - host global do toast (ADR 0003).
- [src/components/common/ConfirmDialog.md](src/components/common/ConfirmDialog.md) - modal de confirmação.
- [src/components/common/PageShell.md](src/components/common/PageShell.md) - casca padrão de página.
- [src/components/common/PageHeader.md](src/components/common/PageHeader.md) - cabeçalho padrão de página.
- [src/components/common/PageGrid.md](src/components/common/PageGrid.md) - grid padrão de página.
- [src/components/common/Panel.md](src/components/common/Panel.md) - painel padrão.
- [src/components/common/PanelHeader.md](src/components/common/PanelHeader.md) - cabeçalho padrão de painel.
- [src/components/common/StatusChip.md](src/components/common/StatusChip.md) - chip de status padrão.
- [src/components/common/Form.md](src/components/common/Form.md) - formulário padrão.
- [src/components/common/FormRow.md](src/components/common/FormRow.md) - linha padrão de campos.
- [src/components/common/FormActions.md](src/components/common/FormActions.md) - ações padrão de formulário.
- [src/components/common/FormField.md](src/components/common/FormField.md) - campo padrão de formulário.
- [src/components/common/Dialog.md](src/components/common/Dialog.md) - diálogo compartilhado via portal.
- [src/components/common/Button.md](src/components/common/Button.md) - botão compartilhado com variantes.
- [src/components/common/Field.md](src/components/common/Field.md) - campo de formulário compartilhado.
- [src/components/common/Table.md](src/components/common/Table.md) - tabela compartilhada.
- [src/components/common/BarcodeManager.md](src/components/common/BarcodeManager.md) - leitura de código de barras.

## Hooks

- [src/hooks/README.md](src/hooks/README.md) - índice dos hooks de estado (arquivos e identificadores em inglês — ADR 0004).

## Tipos

- [src/types/README.md](src/types/README.md) - índice dos tipos compartilhados (`catalog.ts`, `categoria.ts`, `sale.ts`).

## Utilitários

- [src/utils/README.md](src/utils/README.md) - índice dos utilitários (formatação, parsing, limpeza, clipboard, download, preço/margem/unidades, carrinho, toast e QR PIX).
- [src/utils/env.md](src/utils/env.md) - validação centralizada das variáveis de ambiente do servidor Supabase.

## Glossário

- [glossary.md](glossary.md) - termos do domínio por área (Vendas, PIX, Cadastro/Catálogo, Contas).

## Como usar este índice

1. Comece por `CONTEXT.md` (guia rápido) e `DOCS.md` para entender a arquitetura geral.
2. Cada camada em `docs/src/` espelha `src/` — navegue pelo mesmo caminho do arquivo de código.
3. Rode `node scripts/check-docs.mjs` para conferir espelho e links antes de commitar.
4. Ao adicionar um doc novo, crie-o no caminho espelhado e inclua-o aqui.
