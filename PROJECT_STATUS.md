# PROJECT_STATUS.md — Estado atual do projeto

> Fonte da verdade sobre o estado do projeto. Todo agente deve **ler antes de trabalhar** e **atualizar ao final de cada mudança de código**. Complementa `docs/CONTEXT.md` (contexto) e `docs/README.md` (índice).

Atualizado em: **29/10/2026**

## Resumo executivo

Sistema de gestão de vendas (Next.js 16 + React 19 + TypeScript + MUI + React Query + SQLite local). Estágio atual: **estável**. Lint, typecheck e build passam sem erros; as funcionalidades críticas (vendas do dia, histórico, contas a pagar, produtos/estoque, tabela de medicamentos, OCR) foram testadas manualmente sem problemas.

## Estado atual

| Checagem | Resultado |
| --- | --- |
| `npm run lint` | limpo (zero problemas) |
| `npm run lint:css` | limpo (zero problemas) |
| `npm run check:css` | nenhuma classe ausente |
| `npm run styles:check` | tipagem de CSS Modules em dia |
| `npx tsc --noEmit` | zero erros |
| `npm run build` | build de produção OK |
| Teste manual (funcionalidades críticas) | OK na rodada anterior; novos modais de catálogo pendentes de teste visual |

## Últimas mudanças

### Carrinho/estoque: Fase 3 — reconciliação na edição (PUT) — 29/10/2026

- **Implementado:** `PUT /api/vendas` busca itens antigos, calcula ajustes com `getSaleStockAdjustments` e aplica via `applyStockAdjustments`.
- **Escopo:** backend-first; exclusão e devolução nas fases seguintes.
- **Verificação:** `tsc`, `lint` verdes.

### Carrinho/estoque: Fase 2 — integração no POST /api/vendas — 29/10/2026

- **Implementado:** `POST /api/vendas` aplica `SAIDA` de estoque para itens `PRODUTO` após inserir venda/itens; em falha de estoque, reverte venda e itens.
- **Escopo:** backend-first; edição/exclusão e devolução nas fases seguintes.
- **Verificação:** `tsc`, `lint` verdes.

### Carrinho/estoque: Fase 1 — camada de ajuste de estoque — 29/10/2026

- **Implementado:** `applySaleStockMovement(saleId, items, movementType)` e `applyStockAdjustments(saleId, adjustments)` em `src/database/produtosDb.ts`, reutilizando `insertStockMovementRaw` em transação; util puro `getSaleStockAdjustments` em `src/utils/stock.ts`.
- **Escopo:** backend-first; ainda sem integração nas APIs de venda (Fase 2+).
- **Verificação:** `tsc`, `lint`, `check-docs` e `check-encoding` verdes.

### Carrinho/estoque: Fase 0 — decisões (ADR 0011) — 29/10/2026

- **Decisões registradas:** devolução explícita (não automática por valor negativo); quantidade de produto inteira; estoque insuficiente permitido por padrão mas configurável via menu de configurações (a criar); escopo inicial backend-first; movimentações rastreáveis (SAIDA/ENTRADA com venda_id); reconciliação em edição/exclusão.
- **ADR:** `docs/adr/0011-integracao-carrinho-estoque.md` criado e indexado em `docs/README.md`.
- **Verificação:** documentação atualizada; nenhuma alteração de código nesta fase.

### UI: migração dos botões para `Button` (ADR 0010) — 26/10/2026

- **Fases 1 a 9 concluídas:** primitivas compartilhadas, endpoint principal, listagens de vendas, contas a pagar, produtos, importação/PIX, carrinho, páginas/filtros e limpeza.
- **Cobertura:** 113 botões da aplicação migrados para `Button`; restou apenas o item clicável de histórico da tabela, mantido como controle especial de acessibilidade.
- **Variantes/tamanhos:** ações destrutivas usam `danger`, confirmação `success`, navegação/secundárias `info`/`secondary`/`outline`, filtros `ghost` com `aria-pressed`.
- **Carregamento:** botões de upload, busca e importação usam `isLoading`.
- **Botões somente ícone:** usam `iconOnly`, dimensões quadradas e rótulo acessível.
- **Verificação:** `npm run lint`, `lint:css`, `styles:types`, `styles:check`, `check:css`, `tsc`, `build`, `check-encoding`, `check-docs` e `test:calc` verdes.

### Calculadora: exibição de cálculo parcial com sinal final — 26/10/2026

- **Comportamento alterado:** expressão terminada em operador agora exibe o cálculo parcial possível (`5+` -> `5`; `5+7-4+` -> `8`).
- **Parser:** operadores finais são removidos antes da avaliação, sem invalidar a expressão.
- **Baseline:** `npm run test:calc` atualizado para 29 casos, todos verdes.
- **Docs:** `docs/src/lib/calc/calculator.md` atualizado.
- **Verificação:** `tsc`, `lint`, `build`, `check-encoding` e `check-docs` verdes.

### Calculadora: Fase 3 — limpeza final — 26/10/2026

- **Wrapper legado removido:** `src/utils/calculator.ts` e seu doc foram excluídos; não havia consumidores.
- **Índice de utils:** entrada de `calculator.md` removida de `docs/src/utils/README.md`.
- **Verificação:** `npm run test:calc`, `tsc`, `lint`, `build`, `check-encoding` e `check-docs` verdes.

### Calculadora: Fase 2 — integração com formulário — 26/10/2026

- **Carrinho:** `formatCartValue` passou a usar ponto decimal, evitando mistura com a expressão sanitizada.
- **Limpeza:** `clearing` agora é estado real e é ativado/desativado em `handleClear`.
- **Expressão inválida:** `isValueInvalid` foi adicionado; submit e PIX bloqueiam expressão inválida e a UI exibe `Inválido`.
- **Cursor:** `handleValueChange` preserva a posição aproximada do cursor após sanitização.
- **ESC e limpeza:** resetam também o estado de invalidade.
- **Docs:** `docs/src/hooks/useDailySaleForm.md` atualizado.
- **Verificação:** `npm run test:calc`, `tsc`, `lint`, `build`, `check-encoding` e `check-docs` verdes.

### Calculadora: Fase 1 — parser e sinal unário — 26/10/2026

- **Operadores:** operador final não gera mais valor de prefixo; expressão incompleta retorna `null`.
- **Multiplicação implícita:** suportada em `2(3)`, `(2)3` e `(2)(3)`, inclusive em expressões coladas.
- **Sinal unário:** `-5`, `(-2)`, `5*(-2)` e `--5` passam a ser avaliados.
- **Insert de teclas:** operadores binários substituem o operador anterior; o menos unário é anexado.
- **Baseline:** `npm run test:calc` atualizado para 27 casos, todos verdes.
- **Docs:** `docs/src/lib/calc/calculator.md` atualizado.
- **Verificação:** `tsc`, `lint`, `lint:css`, `build`, `check-encoding` e `check-docs` verdes.

### Calculadora: Fase 0 — baseline e decisão de valores negativos — 26/10/2026

- **Baseline criado:** `scripts/test-calculator.mjs` e script `npm run test:calc` compilam a calculadora e validam 22 casos atuais.
- **Decisão registrada:** a calculadora deve aceitar valores negativos (`-5`, `(-2)`, `5*(-2)`), com implementação prevista na Fase 1.
- **Achados registrados:** operador final, multiplicação implícita ausente, sinal unário ausente, mistura de vírgula/ponto no carrinho e cursor no input.
- **Docs:** análise e plano de ação apresentados ao usuário; implementação ainda não iniciada.

### UI: Fase 0 do sistema de botões — `iconOnly` e contrato (ADR 0010) — 26/10/2026

- **`Button`** ganhou `iconOnly`: dimensões quadradas por tamanho, ícone como único conteúdo visual e `children` como rótulo acessível oculto (`srOnly`).
- **Contrato consolidado:** `variant`, `size`, `leftIcon`, `rightIcon`, `isLoading` e `iconOnly`; `icon` segue como alias legado temporário.
- **Acessibilidade:** `isLoading` mantém `disabled`/`aria-busy`; ícones-only aceitam `aria-label` ou `children`.
- **Docs:** `docs/src/components/common/Button.md` atualizado e ADR 0010 criado.
- **Plano:** migração dos 113 botões da aplicação em fases (compartilhados → endpoint principal → vendas → contas → produtos → importação/PIX → carrinho → páginas → limpeza).
- **Verificação:** `styles:types`, `styles:check`, `lint`, `lint:css`, `tsc`, `build`, `check-css`, `check-docs` e `check-encoding` verdes.

### Padrão universal de botão — 25/10/2026

- **`Button`** agora tem aparência única: cor, ícone, texto, formato, arredondamento, borda, fundo e fonte padronizados.
- Props: `icon` opcional e `children`; repassa props nativas do botão.
- Estilos centralizados em `button.module.css`.
- Será aplicado gradualmente substituindo os botões existentes.

### Aplicação do padrão de layout e formulários — 25/10/2026

- **Páginas:** `index`, `historico`, `resumo`, `produtos`, `cadastro`, `tabela` e `contas-a-pagar` usam `PageShell`/`PageHeader`; painéis e formulários migrados para `Panel`/`Form`/`FormActions` onde aplicável.
- **Componentes:** `ProductFilters`, `ProductList`, `EditSaleForm`, `ExportButtons`, `Agenda`, `Summary`, `PayablesForm` e `tabela` usam as primitivas de layout.
- **Verificação:** `tsc`, `lint`, `lint:css`, `styles:check`, `check:css`, `build`, `check-docs` e `check-encoding` verdes.

### Calculadora customizada integrada — 25/10/2026

- **`src/lib/calc/calculator.ts`** passou a ser a referência principal de cálculo do formulário de venda.
- **`useDailySaleForm`** usa `calcularResultado`, `sanitizarExpressao` e `inserirTecla`; `utils/calculator.ts` mantém compatibilidade delegando para a nova calculadora.
- **Docs:** `src/lib/calc/calculator.md`, `src/lib/calc/engine.md` e docs atualizados.

### Padrão de layout e formulários — ADR 0009 — 25/10/2026

- **Primitivas reutilizáveis:** `PageShell`, `PageHeader`, `PageGrid`, `Panel`, `PanelHeader`, `StatusChip`, `Form`, `FormRow`, `FormActions` e `FormField` em `src/components/common/`.
- **Estilos centralizados:** `src/styles/layout.module.css`, derivado do layout de `/contas-a-pagar`, com responsividade equivalente.
- **Adoção gradual:** páginas existentes não foram alteradas; o padrão está disponível para novas páginas e refatorações futuras.
- **Docs:** ADR 0009 e docs dos componentes de layout.

### UI: Fase 2 — modais de catálogo, confirmação, Toast e remoção de styled-jsx (ADR 0008) — 25/10/2026

- **`CatalogEntityModal`** substitui os oito modais de criação/edição de categoria, marca, fornecedor e unidade de medida; campos declarativos, exclusão opcional e IDs existentes preservados.
- **`ConfirmDialog`** migrado para CSS Module, com variante `danger`, IDs opcionais de botões e mensagem `React.ReactNode`; backdrop acima de modais (`calc(var(--z-modal) + 1)`).
- **`ProductDeleteModal`** passa a delegar ao `ConfirmDialog`; variantes de exclusão dos cadastros auxiliares removidas.
- **`Toast`** migrado de `styled-jsx` para `toast.module.css`, usando `--z-toast`.
- **Remoção de `styled-jsx`:** `DailySaleForm`, `DailySalesTotal`, `Summary`, `TotalsByDistributor`, `MonthlyConsolidation`, `MonthNotes`, `PayablesFilterPanel`, `OcrUpload`, `CartModal`, `SelectItemsModal` e `tabela` agora usam CSS Modules; o hover de observações foi movido para `contas.module.css`.
- **Primitivas compartilhadas:** `Button`, `Field`, `Dialog` e `Table` criados em `src/components/common/` com CSS Modules próprios.
- **Tipos** de formulário movidos para `src/types/catalog.ts`; hooks de marca/fornecedor usam um único formulário para criar e editar.
- **Docs:** ADR 0008, `CatalogEntityModal`, `ConfirmDialog`, `ProductDeleteModal`, `Button`, `Field`, `Dialog`, `Table`, `types/catalog`, hooks, `cadastro`, `tabela` e índices.
- **Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run lint:css`, `npm run styles:types`, `npm run styles:check`, `npm run check:css`, `npm run build`, `check-encoding` e `check-docs` verdes.

### UI: Fase 0 + Fase 1 — CSS Modules, tokens e tema por `data-theme` (ADR 0007) — 23/10/2026

- **Fase 0 (correções):** removidas classes órfãs (`agenda-card`, `proximas-list`, `proxima-row`, `ocr-upload-wrapper`, `produtosGridRight`, `CadastroEdicao`, `comum-table`, `epecial-table`); `Agenda` deixou de usar `styled-jsx`; controles do carrinho de `EditSaleForm` ganharam `sales.module.css` próprio; corrigido `padding: 8 24px`; removido vazamento global de `body`/`html` e o `font-size: 12px` global no mobile; removido `page.module.css` morto; corrigidos toast de categoria e limpeza do fornecedor.
- **Fase 1 (fundação):** `globals.css` dividido em `tokens.css`, `base.css`, `utilities.css` e `legacy.css`; tema migrado de classes `html.light`/`html.dark` para `data-theme` com script anti-flash em `_document.tsx`; `Nav` atualiza `dataset.theme`; `body` compensa a altura da nav via token.
- **Ferramentas:** `stylelint` + `npm run lint:css`; `typed-css-modules` gerando `*.d.css.ts` (`styles:types`/`styles:check`); `scripts/check-css-modules.mjs` (`check:css`) valida classes usadas; `check-docs` ignora declarações geradas.
- **Docs:** ADR 0007, `_document`, `_app`, `Nav`, `Agenda`, `EditSaleForm`, `useCategory`, `useSupplier`, `CONTEXT` e `README`.
- **Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run lint:css`, `npm run styles:check`, `npm run check:css`, `npm run build`, `check-encoding` e `check-docs` verdes.

### Nomenclatura: variáveis locais e contrato do carrinho para inglês (ADR 0004) — 22/10/2026

- Renomeadas variáveis locais, estados e memos restantes em páginas/componentes/hooks (ex.: `produtos`→`products`, `servicos`→`services`, `valor`→`amount`, `contasAno`→`accountsYear`, `filteredContas`→`filteredAccounts`, `mes/ano`→`month/year`, `ultimaVenda`→`latestSale`, `loadingItens`→`loadingItems`).
- Contrato do `useCart` normalizado (`selectModalOpen`, `closeSelectModal`, `openCartModal`, `closeCartModal`, `loadCatalogItems`); consumidores em `DailySaleForm` e `EditSaleForm` atualizados.
- APIs/database/services: aliases em inglês preservando chaves de payload/query/colunas SQL (ex.: `{ mes: monthParam, ano: yearParam, filtro: filter }`, `seedCategories`, métricas de consolidação). Nenhum contrato JSON/SQL foi alterado.
- Docs espelhados atualizados (`seeds`, `produtosDb`, `contas-a-pagar`, `useCart`, `OcrUpload`, `PixModal`, `EditSaleForm`).
- Verificação final: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `node scripts/check-encoding.mjs` e `node scripts/check-docs.mjs` verdes.

### Nomenclatura: varredura completa de funções e parâmetros para inglês (ADR 0004) — 22/10/2026

- Renomeadas ~160 funções em `src/services`, `src/database`, `src/hooks`, `src/pages`, `src/pages/api`, `src/components` e `src/utils` (exports, hooks, componentes, handlers locais e helpers), além dos parâmetros de função (ex.: `mes`→`month`, `ano`→`year`, `valor`→`amount`, `nome`→`name`, `descricao`→`description`, `itens`→`items`).
- Varredura feita a pedido explícito do dono (substitui a aplicação apenas incremental do ADR 0004 nesta rodada), com codemod e conferência por AST para não deixar funções/parâmetros pt-BR.
- Contratos preservados: chaves JSON/SQL/query params (`distribuidora`, `valor`, `vencimento`, `documento`, `banco_observacoes`, `mes`, `ano`, `filtro`, `itens`, …) e propriedades de tipos/interfaces permanecem em pt-BR.
- Docs de código (`docs/src/**`) atualizados para os novos identificadores; `docs/CONTEXT.md`, `docs/src/hooks/README.md` e ADR 0004 revisados.
- Verificação: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `node scripts/check-encoding.mjs` e `node scripts/check-docs.mjs` verdes.

### Nomenclatura: tipos/interfaces e props de UI para inglês (ADR 0004) — 22/10/2026

- Renomeados tipos/interfaces de todo o projeto (ex.: `ContaDetalhe`→`AccountDetails`, `VendaDiaria`→`DailySale`, `ProdutoImportado`→`ImportedProduct`, `CategoriaData`→`CategoryData`, `FiltrosState`→`ProductFiltersState`, `SugestaoItem`→`SuggestionItem`), mantendo **apenas propriedades de contrato de dados** em pt-BR (JSON/SQL/query params).
- Renomeados props de componentes, parâmetros de hooks e modelos de UI em catálogo, produtos, payables, summary, vendas, carrinho e importação (ex.: `contasAno`→`accountsYear`, `filtroStatus`→`statusFilter`, `distribuidora`→`distributor`, `precoCompra`→`purchasePrice`, `unidadesMedida`→`unitsOfMeasure`, `movimentacoes`→`movements`, `codigosBarras`→`barcodes`).
- Wiring atualizado em `pages/{cadastro,produtos,contas-a-pagar,index,historico}.tsx`; `Option`/`Actions`/`FormData` seguem os novos nomes; payloads e chaves de API/banco permanecem intactos.
- `MonthlyConsolidation` passou a ser o nome exportado; `Summary` e `ExportButtons` recebem `year`/`month`; `useFilter` expõe `filter`; `UseSalesOptions.filter`.
- Docs espelhados e ADR 0004 atualizados. Verificação: `npx tsc --noEmit` verde (lint/build/encoding/docs no fechamento).

### Docs espelhando `src/` em `docs/src/` + template único (ADR 0006) — 08/10/2026

- **Espelho**: os docs de código passaram a viver em `docs/src/`, com o **mesmo caminho e nome** de `src/` (`.ts`/`.tsx` → `.md`). Componentes ganharam as subpastas de domínio (`cart/`, `sales/`, `catalog/`, `payables/`, …); `Pix.md` → `pix/PixModal.md`; `contas-backup/import.md` → `pages/api/contas/backup.md` e `.../import.md`. Meta-docs (CONTEXT/DOCS/ALIGNMENT/README/ADRs/glossário) permanecem na raiz de `docs/`.
- **Cobertura completa**: criados os 42 docs que faltavam (8 modais de `catalog/`, `ProductDeleteModal`, `Toaster`, 12 hooks, 2 tipos, 19 utils) — cada arquivo de `src/` tem agora seu `.md`.
- **Template único** (4 seções: resumo em citação, `## O que faz`, `## Relações`, `## Notas`), alvo ≤ 30 linhas; aplicado a **todos** os docs de código (`docs/src/` tem 120 `.md`, nenhum acima de 35 linhas). Índices por pasta: `docs/src/hooks/README.md`, `docs/src/utils/README.md`, `docs/src/types/README.md`.
- **Agregados dissolvidos**: `ModaisCadastro.md`/`ModaisDeProdutos.md` removidos (conteúdo migrado para os docs individuais); `Hooks.md`/`Utils.md`/`Types.md` viraram `README.md` de pasta.
- **Validador**: `scripts/check-docs.mjs` (espelho + docs órfãos + links internos quebrados, em todo `docs/`).
- Cross-refs atualizadas: `README.md` (índice reescrito), `CONTEXT.md`, `AGENTS.md`, `documentation-guidelines.md`, ADRs 0003/0005 (e **novo ADR 0006**).
- Verificação: `node scripts/check-docs.mjs` e `node scripts/check-encoding.mjs` verdes.

### Hooks: nomes de arquivo padronizados em inglês (flat) — 08/10/2026

- 8 de 13 arquivos de `src/hooks/` renomeados com `git mv`: `useCategoria.ts`→`useCategory.ts`, `useFiltro.ts`→`useFilter.ts`, `useFornecedor.ts`→`useSupplier.ts`, `useImportItens.ts`→`useImportItems.ts`, `useMarca.ts`→`useBrand.ts`, `useMensais.ts`→`useMonthlyData.ts` (nome escolhido pelo dono), `useUnidadeMedida.ts`→`useUnitOfMeasure.ts`, `useVendas.ts`→`useSales.ts`. Os 5 restantes já estavam em inglês (`useCart`, `useConfirmDialog`, `useDailySaleForm`, `useEscClose`, `useToast`).
- **Estrutura mantida flat** (decisão do dono): 13 arquivos não justificam subpastas — mesmo racional de não aninhar em `src/components/`.
- Imports corrigidos em `cadastro.tsx`, `historico.tsx`, `index.tsx`, `resumo.tsx`, `import/ImportItemsModal.tsx`, `import/ItemNameDropdown.tsx`; **identificadores exportados seguem em pt-BR** (`useVendas`, `useCategoria`...) — renomeio pendente conforme ADR 0004.
- Docs: `docs/src/hooks/README.md` (cabeçalhos com `identificador — arquivo.ts` + nota sobre a divergência), `docs/README.md`, `docs/src/components/import/ImportItemsModal.md`, `docs/src/components/import/ItemNameDropdown.md`.
- Verificação: `npm run lint`, `npx tsc --noEmit`, `npm run build` e `node scripts/check-encoding.mjs` verdes.

### Componentes: conclusão da padronização em inglês (pastas e arquivos) — 08/10/2026

- Pastas restantes em pt-BR renomeadas com `git mv`: `contas/` → **`payables/`**, `cadastro/` → **`catalog/`** (decisão do dono via questionário).
- Arquivos `ContasAPagar*` renomeados: `PayablesForm.tsx`, `PayablesFilterPanel.tsx`, `PayablesHeader.tsx`, `PayablesLastTen.tsx`, `PayablesModals.tsx` (5 `docs/src/components/**/*.md` correspondentes renomeados).
- **Imports corrigidos** (`contas-a-pagar.tsx`, `cadastro.tsx`, `useBrand.ts`, `useSupplier.ts`) e referências/docs atualizados (`README`, `CONTEXT`, `DOCS`, `ModaisCadastro.md`, ADR 0005).
- **Corrigido bug da rodada anterior**: caminhos duplicados em docs (`src/components/sales/sales/...`, `common/common/`, `import/import/`, `contas/contas/`) — 18 ocorrências em 17 arquivos geradas por substituição de caminho sobre caminho.
- **Sem subpastas aninhadas**: cada pasta tem 5–8 arquivos; aninhar (`products/`, `products/master-data/` etc.) não ganha organização.
- **Identificadores internos seguem em pt-BR** (`const ContasAPagarForm` dentro de `PayablesForm.tsx`, `ModalCarrinho` em `CartModal.tsx`...) — renomeio incremental conforme ADR 0004.
- Verificação: `npm run lint`, `npx tsc --noEmit`, `npm run build` e `node scripts/check-encoding.mjs` verdes.

### Componentes: nomes em inglês + subpastas por domínio (ADR 0005) — 08/10/2026

- `src/components/` reorganizado: ~45 arquivos movidos com `git mv` para 9 pastas por domínio (`cart/`, `sales/`, `summary/`, `contas/`→`payables/`, `products/`, `cadastro/`→`catalog/`, `import/`, `pix/`, `common/`) e renomeados para inglês (ex.: `ModalCarrinho.tsx` → `cart/CartModal.tsx`, `FormularioProduto.tsx` → `products/ProductForm.tsx`, `Resumo.tsx` → `summary/Summary.tsx`).
- **Imports corrigidos em todo `src/`** (páginas, hooks, componentes): cross-pasta via `@/components/<pasta>/<Arquivo>`; profundidade de `../utils|services|hooks` ajustada nos arquivos movidos.
- **Excluídos** (sem uso ativo, confirmado por busca de imports): `ModalServicos.tsx`, `FloatingPixWindow.tsx` e as duplicatas antigas em pt-BR (`ModalCarrinho`, `ModalSelecionarItens`, `CartModalShell`, `FormularioProduto`, `ItemNomeDropdown`, `ModalImportItens` na raiz) — completando a migração parcial anterior.
- **Identificadores internos mantidos em pt-BR** nesta rodada (decisão do dono): `const ModalCarrinho` continua dentro de `CartModal.tsx`; renomeio segue o ADR 0004, ao tocar nos módulos.
- Docs: 14 `docs/src/components/**/*.md` renomeados para inglês (`CartModal.md`, `SelectItemsModal.md`, `ImportItemsModal.md`, `ProductForm.md`, `ItemForm.md`, `ServiceForm.md`, `ItemNameDropdown.md`, `ProductList.md`, `ProductFilters.md`, `Summary.md`, `MonthlyConsolidation.md`, `MonthNotes.md`, `TotalsByDistributor.md`, `StockAdjustModal.md`); referências em `docs/README.md`, `docs/CONTEXT.md`, `docs/DOCS.md` e docs de páginas/serviços atualizadas; seções de `ModalServicos`/`FloatingPixWindow` removidas de `ModaisCadastro.md`, `ModaisDeProdutos.md` e `Pix.md`.
- **Novo ADR** `docs/adr/0005-agrupamento-de-componentes-por-dominio.md` (índice `docs/README.md` atualizado).
- Verificação: `npm run lint`, `npx tsc --noEmit`, `npm run build` e `node scripts/check-encoding.mjs` verdes.

### Limpeza de encoding: mojibake e BOM (08/10/2026)

- `node scripts/check-encoding.mjs` encontrou **82 problemas** em 9 arquivos: mojibake (UTF-8 interpretado como ANSI/cp1252 — acentos e travessões virando dois caracteres lixo) e BOM (U+FEFF) no início do arquivo — gerados por gravação via PowerShell (Windows-1252/ANSI).
- Reparados com `node scripts/check-encoding.mjs --fix`; segunda execução: **ENCODING OK** (nenhum mojibake, BOM ou caractere estranho).
- Arquivos corrigidos: `src/components/EditSaleForm.tsx`, `src/components/cart/{CartModal,CartModalShell,SelectItemsModal}.tsx`, `src/components/forms/ProductForm.tsx`, `src/components/import/{ImportItemsModal,ItemNameDropdown}.tsx`, `src/pages/{cadastro,index}.tsx`.
- Verificação: `npm run lint` e `npx tsc --noEmit` verdes.
- **Nova regra de agente**: proibido criar/gravar código via PowerShell — registrada em `AGENTS.md` (regra 5, "Framework e boas práticas") e `docs/CONTEXT.md` (regra 10).

### Limpeza de lint: 188 problemas → 0 (etapas 1–10)

- **Etapas 1–7**: scripts (`run-next.mjs`), tipos, utilitários, persistência (`db.ts`, `contasDb`, `notasDb`, `tabelaDb`, `produtosDb`), hooks e APIs internas — eliminação de `any`, imports mortos, tipagens concretas e `catch {` sem parâmetro.
- **Etapa 8 (componentes)**: `BarcodeManager` (ref como prop separada de `data`), `ModalImportItens`, `ModalProdExclusao` e outros 4 modais (hooks antes do `return null`), `ModalServicos`, `Nav`/`SalesTable` (lazy initializers com guard de `window`), `DailySaleForm`.
- **Etapa 9 (páginas)**: `tabela`, `contas-a-pagar`, `produtos`, `cadastro` — `useCallback` + deferral `setTimeout(0)` para a regra `react-hooks/set-state-in-effect`, correções de `catch`, clamps de filtro movidos para handlers, imutabilidade em `codigosBarras`.
- **Etapa 10**: `npm run lint` zerado.

### Correções de tipo (descobertas no `tsc --noEmit`)

- `src/database/produtosDb.ts`: `ItemUnidadeData` com `sigla?`/`descricao?`; casts seguros em `barcodes`/`unidades_medida`.
- `src/pages/api/produtos/itens.ts`: casts dos `.get()`; variável `unidadeMedida` restaurada.
- `src/pages/api/tabela.ts`: `JSON.parse(... as string)`.
- `src/pages/api/vendas.ts`: interface local `ItemVendaApi` + normalização de itens (POST/PUT); import de `VendaItemInput` removido.
- `src/components/PayablesModals.tsx`: `onSave` tipado como `(event: React.FormEvent<HTMLButtonElement>) => void`.

### Documentação

- `docs/src/components/common/BarcodeManager.md`, `docs/src/components/payables/PayablesModals.md`, `docs/src/pages/api/vendas.md`, `docs/src/database/produtosDb.md` atualizados.
- `AGENTS.md` com novas regras para agentes (documentação de mudanças, framework/boas práticas, conflito com regras).
- Criado este arquivo (`PROJECT_STATUS.md`).

### Limpeza de dependências sem uso

- Removidas do `package.json` (e `package-lock.json`/`node_modules` via `npm uninstall`): `date-fns-tz`, `lucide`, `lucide-react`, `papaparse`, `pdf-parse`, `pdf-poppler`; e `@types/papaparse` (dev).
- `@emotion/react` e `@emotion/styled` **mantidos**: são peer dependencies obrigatórias do `@mui/material` (usado via `Tooltip` e ícones).
- Removida a declaração órfã `src/types/pdf-poppler.d.ts` (o `pdfService.ts` usa `pdf2pic`, não `pdf-poppler`).
- Docs sincronizados: `docs/CONTEXT.md` (pilha principal), `docs/src/types/README.md` e `docs/README.md`.

### Padronização de validação de campos (entrevista `grill-with-docs`, ADR 0002)

- Entrevista concluída; decisões registradas em `docs/adr/0002-padrao-de-validacao-de-campos.md` (**status: aceito e implementado**).
- Contrato `{ ok, message }` (mensagens pt-BR hardcoded), consumo por campo, parsing desacoplado, `validateEmail` mantida e migrada ao contrato novo, `isEditableDate` consolidada em `canEdit`, escopo de campos: vendas, contas (incl. status), produtos, cadastros auxiliares e transversais (obrigatório, ids numéricos, tamanho, e-mail).
- Glossário ampliado (`docs/glossary.md`, seção "Padrões de validação"); índice `docs/README.md` e tabela "Tema → Documentos" do `docs/CONTEXT.md` atualizados.

### Implementação do ADR 0002 (código)

- `utils/validation.ts` reescrito como **validação pura**: `ValidationResult` (`{ ok, message }`), `validateRequired`, `validateEmail`, `validateCurrency`, `validateDate`; `isEditableDate` e parsing removidos.
- `utils/number.ts`: novo normalizador `parseCurrency` (preserva o comportamento do antigo `validateCurrency`, retorno `number | null`).
- Migração de call sites para normalizadores: `utils/date.ts`/`toDate` para datas e `parseCurrency` para valores em `src/pages/api/vendas.ts`, `src/pages/api/contas/import.ts` e `src/components/DailySaleForm.tsx`.
- Regra de 2 dias unificada: `isEditableDate` (validation.ts) substituída por `canEdit` (`utils/edit.ts`) na API de vendas — eliminada duplicidade.
- Verificação: `npm run lint`, `npx tsc --noEmit` e `npm run build` verdes.
- Docs sincronizados: `docs/src/utils/README.md` (módulos e observações) e `docs/CONTEXT.md` (regra 6 de validação).

### Ícones PIX migrados para `@mui/icons-material`

- Substituídos todos os ícones `data-lucide` (nunca renderizados, dependiam do pacote removido) por ícones MUI em `ModalPix.tsx`, `FloatingPixWindow.tsx` e no toast de `ActionPix.tsx`.
- `ModalPix.tsx`/`FloatingPixWindow.tsx`: `CloseIcon`, `ContentCopyIcon`, `FileDownloadIcon`, `PrintIcon`.
- `ActionPix.tsx`: o toast injeta SVG inline (via `innerHTML`), já que ícones MUI exigem React/JSX.

### Adoção incremental do contrato `{ ok, message }` (ADR 0002)

- Hooks de cadastro (`useCategoria`, `useFornecedor`, `useMarca`, `useUnidadeMedida`): obrigatórios (nome/sigla) via `validateRequired`.
- `contas-a-pagar.tsx`: distribuidora, valor, vencimento e documento via `validateRequired`/`validateCurrency`; mantidas a regra de negócio "valor > 0" e a normalização com `parseNumber`.
- `cadastro.tsx`: nome do item, categoria, marca, fornecedor, unidade de medida e código de barras via `validateRequired`.
- `DailySaleForm.tsx`: valor (obrigatório/formato) e data via `validateRequired`/`validateCurrency`/`validateDate`; removido o uso direto de `toDate` no submit.
- `validation.ts`: novo `validateNumber` (números não monetários — transversal do ADR); ajuste de estoque do `cadastro.tsx` migrado para ele.
- **Decisão (opção A)**: regras de negócio (ex.: "valor > 0"), validação de IDs/parâmetros dos endpoints e toasts de carga/erro de API ficam **fora** do contrato — decisão documentada no ADR 0002.
- Lint, tsc e build verdes.

### Sessão de alinhamento (contexto do domínio)

- Criado `docs/ALIGNMENT.md` — guia de alinhamento (negócio, usuários, fluxos, pontos de atenção) para a futura refatoração, alimentado com o contexto do dono.
- Já registrado: estabelecimento (farmácia → expandido), origem do sistema, público-alvo (idosos, UX de "digitar valor + ENTER"), uso individual sem auth via Tailscale, rotina (registro de vendas é o fluxo principal) e invariantes que a refatoração não pode quebrar.
- Seções 2 (fluxos) e 3 (regras de domínio) ainda *aguardando contexto*.
- Índice (`docs/README.md`) e `docs/CONTEXT.md` atualizados com o novo doc.

### Fundações da refatoração — Fase 0 (utilitários compartilhados)

- Decisões do dono: começar pelas **fundações/utilitários**; direção de estilos **decidida depois**.
- Novos módulos em `src/utils/` (fonte única e descobrível, perfil de `ALIGNMENT.md` §4.5):
  - `clipboard.ts` — `copyToClipboard` extraído de `ActionPix.tsx` (API nativa + fallback `execCommand`).
  - `download.ts` — `downloadDataUrl` (extraído do `downloadQrPng`).
  - `productPrice.ts` — `calculateSalePrice`/`calculateMargin`: **regra de negócio** do catálogo que estava duplicada nos 3 handlers de preço do `FormularioProduto.tsx` (agora centralizada; import de `formatCurrencyNumber` removido do componente; renomeado de `produtoPreco.ts` para o padrão de nomenclatura em inglês — ADR 0004).
- Módulos não-UI movidos de `src/components/` para `src/utils/`: `QrPix.tsx` → `qrPix.ts` e `ActionPix.tsx` → `pixActions.ts` (comportamento preservado; `copyToClipboard` passou a vir de `clipboard.ts` e o download de `download.ts`).
- Importadores atualizados: `ModalPix.tsx` e `FloatingPixWindow.tsx` (`@/utils/qrPix`, `@/utils/pixActions`, `@/utils/clipboard`).
- **Achados (registrados para a próxima fase)**: `#toast-root` não é renderizado por nenhuma página → `pixActions.showToast` não exibe nada (bug latente; unificação de toasts é o próximo alvo); `FormPix.tsx` (`src/components/`) é módulo legado (DOM, `.tsx` sem JSX) **sem chamadas ativas** — candidato a remoção.
- Verificação: `npm run lint`, `npx tsc --noEmit` e `npm run build` verdes.
- Docs sincronizados: `docs/src/utils/README.md` (5 módulos novos + observações), `docs/src/components/pix/PixModal.md` (caminhos/assinaturas) e `docs/README.md` (índice).

### Unificação de toasts (ADR 0003)

- **Store singleton** `src/utils/toast.ts` (`showToast`, `dismissToast`, `subscribeToast`, `getToastSnapshot`/`getServerToastSnapshot`) como fonte única de notificações.
- `src/hooks/useToast.ts` reescrito para consumir o store via `useSyncExternalStore` (mesma API pública; funções estáveis seguras em deps de `useCallback`).
- **Host global** `src/components/Toaster.tsx` montado em `src/pages/_app.tsx` (uma única instância, posição `top-right`).
- Migradas 7 páginas (`index`, `historico`, `resumo`, `produtos`, `cadastro`, `contas-a-pagar`, `tabela`) e 2 componentes (`DailySaleForm`, `OcrUpload`) para `useToast()` — estado local e `<Toast>` por página removidos.
- `pixActions.showToast` (DOM) **removido**; `ModalPix`/`FloatingPixWindow` usam `showToast` do store — **corrige o bug** do toast PIX (`#toast-root` nunca era renderizado, toasts eram silenciosamente inexistentes).
- Decisão de UX (aprovada): toast da venda passa de `local-top-right` para `top-right` global.
- SSR: `getServerSnapshot` retornando estado inicial (nenhum toast no servidor; build de produção OK).
- Docs: `docs/src/components/common/Toast.md` (reescrito), `docs/src/hooks/README.md`, `docs/src/utils/README.md`, `docs/src/components/pix/PixModal.md`, `docs/src/pages/_app.md`, `docs/README.md`, `docs/CONTEXT.md`, **novo ADR** `docs/adr/0003-padrao-de-notificacoes-toast.md`.
- **Novos padrões**: `docs/documentation-guidelines.md` (padrão de documentação, referenciado no `AGENTS.md`).
- Verificação: lint, tsc e build verdes.

### Padrão de nomenclatura (ADR 0004) e limpeza do legado

- Decisão do dono: identificadores, funções e nomes de arquivo em **inglês**; pt-BR apenas em strings visíveis ao usuário. Regra no `AGENTS.md` (boas práticas) + **novo ADR** `docs/adr/0004-padrao-de-nomenclatura-dos-identificadores.md`. Aplicação: gradual — código novo/refatorado em inglês; a renomeação do restante ocorre ao tocar nos módulos.
- `src/utils/productPrice.ts` renomeado para o novo padrão (antes `produtoPreco.ts`; ver acima).
- **`FormPix.tsx` removido** (legado sem chamadas ativas, decisão do dono); docs atualizados em `docs/src/components/pix/PixModal.md` e `docs/README.md`.

### Refatoração de `DailySaleForm` (primeiro componente grande)

- **`src/types/sale.ts` criado** — `CartItem`/`CatalogItemType` movidos do componente `DailySaleForm` para a camada de tipos (compartilhados por `useCart`, `ModalCarrinho`, `ModalSelecionarItens` e `DailySaleForm`/`EditSaleForm`); importadores atualizados (importação `type`).
- **`src/utils/calculator.ts` criado** — `evaluateExpression(input)` puro/testável (`expr-eval`) com a regra do campo de valor (vírgula→ponto, fallback sem o último operador).
- **`src/hooks/useDailySaleForm.ts` criado** — concentra estado/validação/ações/efeitos do formulário: filtro de teclas, sanitização do valor, sincronização com o total do carrinho, ESC/limpar, PIX, `handleSubmit` (cadeia de validação ADR 0002 → `registrarVenda` → limpeza/foco), auto-foco (1min/3min); usa `useCart(showToast)` e `evaluateExpression`.
- **`DailySaleForm.tsx` reescrito fino** (691 → ~417 linhas): apresentacional, apenas JSX + `<style jsx>` + ligação ao hook. **Comportamento preservado** (nenhuma regra alterada).
- **ADR 0004 aplicado no módulo**: `valor`→`value`, `observacoes`→`observations`, `limpando`→`clearing`, `estaVisivel`→`isVisible`, comentários/regra do `expr-eval` extraída.
- Docs: `docs/src/components/sales/DailySaleForm.md` (reescrito), `docs/src/hooks/README.md` (nova seção `useDailySaleForm` + nota do `CartItem`), `docs/src/types/README.md` (nova seção `sale.ts`), `docs/src/components/cart/CartModal.md` (origem do tipo), `docs/src/utils/README.md` (`calculator.ts`), `docs/README.md` (índice).
- Verificação: lint, tsc e build de produção verdes.

## Gravação de arquivos: nunca usar PowerShell

- **Proibido gravar/editar arquivos do projeto com cmdlets do PowerShell** (`Set-Content`, `Out-File`, `Add-Content` etc.): a codificação padrão do Windows (ANSI/cp1252) gera arquivos *válidos* em UTF-8 porém com os acentos de palavras como `mês` virados em dois caracteres lixo, e o estrago só aparece na tela — lint, typecheck e build passam normalmente.
- Sempre gravar em UTF-8 explícito (as ferramentas de edição do opencode gravam UTF-8).
- **Rede de segurança**: `node scripts/check-encoding.mjs` (relata e sai com exit 1) e `node scripts/check-encoding.mjs --fix` (repara mojibake/BOM inequívocos). Rodar antes de commitar; sem dependências (só `node:fs`/`node:path`).
- Caracteres legítimos (`—`, `–`, `…`, aspas curvas) não são afetados: o script é sensível ao contexto e não acusa texto bom.

## Pendentes

- Nenhuma pendência de lint/typecheck/build.
- **Migração de botões (ADR 0010):** Fase 0 concluída; próximas fases: compartilhados (9), endpoint principal (20), listagens de vendas (11), contas a pagar (20), produtos (21), importação/PIX (10), carrinho (9), páginas/filtros (13) e limpeza final. Os controles especiais (`historyItem`, drop zone e item clicável do catálogo) ficam para uma fase de acessibilidade.
- **Calculadora:** Fases 0, 1, 2 e 3 concluídas. Implementação encerrada; restam apenas testes manuais opcionais no formulário.
- **Botões (ADR 0010):** migração concluída. Resta apenas revisão visual manual opcional e remoção futura de classes CSS legadas não referenciadas.
- **Melhorias futuras recomendadas (P2/P3 do DOCS.md)**: abstração de dados de tabela/histórico; tipagem forte de `fetch`; extrair XML/OCR de `contas/import.ts`; testes automatizados; transversais ainda não implementados do ADR (tamanho máximo de strings).
- **Refatoração (direção registrada em `docs/ALIGNMENT.md` seção 4)**: Fase 0 (fundações/utilitários), unificação de toasts (ADR 0003), padrão de nomenclatura (ADR 0004), `DailySaleForm` extraído (hook `useDailySaleForm` + `utils/calculator` + `types/sale.ts`), agrupamento por domínio (ADR 0005) e **Fase 0 + Fase 1 de estilos (ADR 0007)** concluídos. Próximos alvos:
  - **UI Fase 2 concluída**: modais de catálogo, `ConfirmDialog`, `Toast`, primitivas (`Dialog`, `Field`, `Button`, `Table`) e remoção do restante de `styled-jsx` (11 componentes). `useCatalogCrud` não foi necessário; `CatalogEntityModal` cobre a consolidação. Grandes módulos (`contas`/`produtos`) permanecem para refatoração visual futura.
  - **Grandes componentes** mistos (UI+estado+validação+API): `CartModal`, `ImportItemsModal`, `ProductForm`, `SelectItemsModal` — extrair hooks/serviços/subcomponentes (mesmo padrão de `DailySaleForm`).
- Mudanças desta rodada **não commitadas**.

## Futuras / Melhorias sugeridas

- Validação adicional em `npm run dev` para cenários não cobertos pelo teste crítico.
- Revisar formatação de exportação (`jspdf`/`xlsx`) para reforço visual, se desejado.
- Manter docs e `PROJECT_STATUS.md` alinhados a qualquer evolução de API ou regra.

## Como manter este arquivo

- **Sempre** que um agente fizer modificações de código: mover a mudança para "Últimas mudanças" (com data), ajustar "Pendentes"/"Futuras", e atualizar a data no topo.
- Atualizações/mudanças  antigas (3x) devem ser descartadas.
- Atualizar também o doc correspondente em `docs/` (e `docs/README.md`/`CONTEXT.md` se necessário) antes de encerrar a tarefa.