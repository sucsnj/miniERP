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
- [adr/0009-padroes-de-layout-e-formularios.md](adr/0009-padroes-de-layout-e-formularios.md) - ADR: padrão de layout e formulários baseado em `/payables`.
- [adr/0010-sistema-de-botoes-com-variantes.md](adr/0010-sistema-de-botoes-com-variantes.md) - ADR:
- [adr/0011-integracao-carrinho-estoque.md](adr/0011-integracao-carrinho-estoque.md) - ADR: integração do carrinho com estoque (devolução explícita, quantidade inteira, estoque negativo configurável, backend-first). botões com variantes funcionais, tamanhos, carregamento e `iconOnly`.
- [adr/0012-migracao-sqlite-para-supabase.md](adr/0012-migracao-sqlite-para-supabase.md) - ADR: migração do SQLite local para Supabase/Postgres (schema public, UUID, RPC, nomenclatura inglesa ponta a ponta).
- [adr/0013-autenticacao-multiempresa-multiloja.md](adr/0013-autenticacao-multiempresa-multiloja.md) - ADR: autenticação própria, sessão de 48h, papéis admin/merchant e isolamento multiempresa/multi-loja.

## Páginas do Frontend

- [src/proxy.md](src/proxy.md) - proxy do Next.js 16: proteção otimista de rotas autenticadas.
- [src/pages/admin.md](src/pages/admin.md) - administração da empresa (nome, lojas e vendedores).
- [src/pages/profile.md](src/pages/profile.md) - perfil do administrador (foto, dados pessoais e senha).
- [src/pages/index.md](src/pages/index.md) - dashboard de vendas: resumo mensal, formulário, edição e backup.
- [src/pages/products.md](src/pages/products.md) - catálogo, estoque e preços de produtos.
- [src/pages/registration.md](src/pages/registration.md) - cadastros auxiliares (categorias, marcas, fornecedores, unidades de medida).
- [src/pages/payables.md](src/pages/payables.md) - contas a pagar: filtros, importação de XML e pagamentos.
- [src/pages/history.md](src/pages/history.md) - histórico de vendas, listagem e busca.
- [src/pages/summary.md](src/pages/summary.md) - resumo mensal de vendas e totais consolidados.
- [src/pages/medicine-table.md](src/pages/medicine-table.md) - upload e consulta da tabela de medicamentos.
- [src/pages/settings.md](src/pages/settings.md) - configurações do aplicativo.
- [src/pages/login.md](src/pages/login.md) - login com `login` ou `email`.
- [src/pages/setup.md](src/pages/setup.md) - bootstrap do primeiro admin via `PIN_MASTER`.
- [src/pages/_app.md](src/pages/_app.md) - configuração global do app, ordem do CSS e integração com React Query.
- [src/pages/_document.md](src/pages/_document.md) - documento HTML, idioma e aplicação do tema antes da hidratação.

## Referência de API

> ADR 0013 Fase 3/4: todas as API routes não pertencentes a `/api/auth/*` exigem sessão via `requireApiAuth` e repassam `AuthContext`. Permissões: `merchant` só escreve em vendas (criar/editar); todas as demais escritas são admin-only.

### Backup


### Financeiro

- [src/pages/api/auth/bootstrap.md](src/pages/api/auth/bootstrap.md) - bootstrap do primeiro admin/empresa via PIN_MASTER.
- [src/pages/api/auth/login.md](src/pages/api/auth/login.md) - login por login/e-mail com sessão de 48h.
- [src/pages/api/auth/logout.md](src/pages/api/auth/logout.md) - logout e revogação de sessão.
- [src/pages/api/auth/me.md](src/pages/api/auth/me.md) - contexto da sessão atual.
- [src/pages/api/auth/change-password.md](src/pages/api/auth/change-password.md) - troca de senha e revogação de sessões.
- [src/pages/api/avatar.md](src/pages/api/avatar.md) - upload de foto de usuário para Supabase Storage.
- [src/pages/api/auth/profile.md](src/pages/api/auth/profile.md) - perfil do administrador (nome, apelido e e-mail).
- [src/pages/api/auth/profile/password.md](src/pages/api/auth/profile/password.md) - troca de senha do administrador.
- [src/pages/api/admin/company.md](src/pages/api/admin/company.md) - empresa atual (admin).
- [src/pages/api/admin/stores.md](src/pages/api/admin/stores.md) - lojas da empresa (admin).
- [src/pages/api/admin/merchants.md](src/pages/api/admin/merchants.md) - vendedores e lojas autorizadas (admin).
- [src/pages/api/settings.md](src/pages/api/settings.md) - padrões da empresa e configurações compartilhadas.
- [src/pages/api/settings/pix-presets.md](src/pages/api/settings/pix-presets.md) - presets PIX atômicos da empresa.
- [src/pages/api/stores.md](src/pages/api/stores.md) - lojas autorizadas e troca de loja atual.
- [src/pages/api/sales.md](src/pages/api/sales.md) - CRUD de vendas diárias.
- [src/pages/api/sale-items.md](src/pages/api/sale-items.md) - itens de venda (carrinho).
- [src/pages/api/invoices.md](src/pages/api/invoices.md) - consulta de notas fiscais.
- [src/pages/api/monthly-sales.md](src/pages/api/monthly-sales.md) - relatórios de vendas mensais.
- [src/pages/api/payables.md](src/pages/api/payables.md) - CRUD de contas a pagar (listar, criar, pagar, cancelar, atualizar, excluir).

### Produtos e Estoque

- [src/pages/api/products.md](src/pages/api/products.md) - CRUD de produtos (catálogo).
- [src/pages/api/products/categories.md](src/pages/api/products/categories.md) - categorias.
- [src/pages/api/products/brands.md](src/pages/api/products/brands.md) - marcas.
- [src/pages/api/products/suppliers.md](src/pages/api/products/suppliers.md) - fornecedores.
- [src/pages/api/products/units-of-measure.md](src/pages/api/products/units-of-measure.md) - unidades de medida.
- [src/pages/api/products/items.md](src/pages/api/products/items.md) - itens de produto.
- [src/pages/api/products/services.md](src/pages/api/products/services.md) - serviços.
- [src/pages/api/products/stock-movements.md](src/pages/api/products/stock-movements.md) - movimentações de estoque.

### Importação e OCR

- [src/pages/api/ocr.md](src/pages/api/ocr.md) - upload e processamento OCR.
- [src/pages/api/medicine-table.md](src/pages/api/medicine-table.md) - upload, busca com cache e histórico da tabela de medicamentos.
- [src/pages/api/payables/import.md](src/pages/api/payables/import.md) - importação de contas via XML.

## Serviços

- [src/services/profileService.md](src/services/profileService.md) - API cliente de perfil do administrador.
- [src/services/avatarService.md](src/services/avatarService.md) - upload e validação de fotos de usuário (5 MB).
- [src/services/adminService.md](src/services/adminService.md) - API cliente de administração (empresa, lojas, vendedores).
- [src/services/settingsService.md](src/services/settingsService.md) - API cliente de configurações do tenant.
- [src/services/payablesService.md](src/services/payablesService.md) - API cliente de contas a pagar.
- [src/services/invoicesService.md](src/services/invoicesService.md) - API cliente de notas fiscais.
- [src/services/ocrService.md](src/services/ocrService.md) - OCR e upload de arquivos.
- [src/services/pdfService.md](src/services/pdfService.md) - conversão de PDF em imagem e pré-processamento para OCR.
- [src/services/productsService.md](src/services/productsService.md) - API cliente de produtos/catálogo.
- [src/services/medicineTableService.md](src/services/medicineTableService.md) - API cliente da tabela de medicamentos (upload, busca, histórico, status).
- [src/services/salesService.md](src/services/salesService.md) - API cliente de vendas diárias.

## Banco de Dados

- [supabase.md](supabase.md) - guia do Supabase: aplicar schema, convenções, RPCs, segurança e Vercel.
- [src/database/supabase.md](src/database/supabase.md) - client server-only do Supabase (service role, sessão desabilitada).

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
- [src/components/products/ProductPriceSection.md](src/components/products/ProductPriceSection.md) - seção de preços do formulário de produto.
- [src/components/products/ProductUnitsSection.md](src/components/products/ProductUnitsSection.md) - seção de unidades de medida do formulário de produto.
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

### Autenticação (`src/components/auth/`, `src/contexts/AuthContext.tsx`)

- [src/contexts/AuthContext.md](src/contexts/AuthContext.md) - contexto global do usuário autenticado (`/api/auth/me`, login e logout).
- [src/contexts/RouteLoadingContext.md](src/contexts/RouteLoadingContext.md) - gate global de carregamento da rota: só exibe a página quando todas as tarefas iniciais terminarem.
- [src/components/auth/AuthGate.md](src/components/auth/AuthGate.md) - gate client-side que protege as rotas autenticadas e redireciona para login.
- [src/components/auth/RequireAdmin.md](src/components/auth/RequireAdmin.md) - gate de áreas exclusivas de administradores.

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
- [src/components/common/Skeleton.md](src/components/common/Skeleton.md) - helper de skeleton loading (blocos, texto, tabela, cards, página).
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
- [src/components/common/AvatarPicker.md](src/components/common/AvatarPicker.md) - seletor compartilhado de foto de usuário.

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
