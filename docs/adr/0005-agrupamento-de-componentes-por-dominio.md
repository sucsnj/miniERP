# ADR 0005 — Agrupamento de componentes em subpastas por domínio

- **Status:** aceito e implementado (08/10/2026).
- **Decisores:** dono do projeto (opção "Pastas por domínio") + agente de IA.
- **Data:** 08/10/2026.

## Contexto

`src/components/` acumulava ~50 arquivos soltos na raiz, com nomes misturando pt-BR e inglês (`ModalCarrinho.tsx`, `DailySaleForm.tsx`, `FormularioProduto.tsx`). A busca de arquivos era difícil e a raiz não comunicava a que domínio cada componente pertencia. Uma tentativa anterior já havia criado duplicatas parciais em `cart/`, `forms/` e `import/` sem completar a migração dos imports.

## Decisão

**Arquivos de componentes em inglês, agrupados em subpastas por domínio** (uma camada abaixo de `src/components/`):

| Pasta | Domínio | Exemplos |
| --- | --- | --- |
| `cart/` | carrinho da venda | `CartModal`, `CartModalShell`, `SelectItemsModal` |
| `sales/` | vendas do dia / dashboard / histórico | `DailySaleForm`, `EditSaleForm`, `SalesChart`, `SalesTable`, `ExportButtons` |
| `summary/` | resumo e consolidação | `Summary`, `MonthlyConsolidation`, `MonthNotes`, `TotalsByDistributor` |
| `payables/` | contas a pagar | `Agenda`, `Payables*` (antes `ContasAPagar*`) |
| `products/` | catálogo e estoque | `ProductList`, `ProductForm`, `ItemForm`, `ServiceForm`, `ProductFilters`, `ProductDeleteModal`, `StockAdjustModal` |
| `catalog/` | modal genérico dos cadastros auxiliares | `CatalogEntityModal` |
| `import/` | importação XML e OCR | `ImportItemsModal`, `ItemNameDropdown`, `OcrUpload` |
| `pix/` | pagamento PIX | `PixModal` |
| `common/` | UI transversal | `Nav`, `Toast`, `Toaster`, `ConfirmDialog`, `BarcodeManager` |

- **Só arquivos/pastas nesta rodada**: os identificadores internos (`const ModalCarrinho`, props, JSX) permanecem em pt-BR e serão renomeados ao tocar nos módulos (ADR 0004, aplicação gradual). Como o default export define o componente, o nome do arquivo não precisa coincidir com o nome do componente.
- **Imports entre componentes** usam `@/components/<pasta>/<Arquivo>` (cross-pasta) ou `./<Arquivo>` (mesma pasta); imports para `utils`/`services`/`hooks` seguem o estilo de cada arquivo, corrigidos para a nova profundidade.
- **Docs espelham `src/`** em `docs/src/` (mesmos caminhos e nomes) — ver ADR 0006; `docs/README.md` é o índice central.
- **Removidos por não terem uso ativo** (confirmado por busca de imports): `ModalServicos.tsx`, `FloatingPixWindow.tsx` e as duplicatas antigas em pt-BR substituídas pelas novas.

## Consequências

**Positivas:**
- Raiz de `src/components/` limpa; agrupamento por domínio orienta onde criar/ler componentes.
- Alinhado ao ADR 0004 (nomes de arquivo em inglês) e ao movimento de refatoração em curso (`docs/ALIGNMENT.md` §4).

**Negativas / aceitas:**
- Divergência transitória entre nome do arquivo (inglês) e identificadores internos (pt-BR) até a migração incremental de identificadores.
- Imports relativos ganharam um nível de profundidade; arquivos movidos exigiram correção mecânica de todos os specifiers (verificada com `tsc`/`lint`/`build`).

## Alternativas consideradas

- **Só renomear para inglês, sem pastas:** rejeitado — a raiz com ~50 arquivos continuaria poluída.
- **Pastas por tipo técnico (`forms/`, `modais/`):** rejeitado — separa o que o usuário/domínio une (ex.: `ProductForm` e `StockAdjustModal` são do mesmo catálogo).
- **Pastas maiores (5-6):** considerado, mas o dono optou pelo agrupamento por domínio (9 pastas).

## Referências

- `AGENTS.md` → regra de nomenclatura (ADR 0004).
- `docs/CONTEXT.md` → seção "Camadas".
- `docs/documentation-guidelines.md` (padrão de documentação).
