# ADR 0004 — Padrão de nomenclatura dos identificadores de código

- **Status:** aceito e em vigor (07/10/2026); varredura completa de funções/parâmetros, tipos e props de UI aplicada em 22/10/2026.
- **Decisores:** dono do projeto (opção "Inglês (recomendado)") + agente de IA.
- **Data:** 07/10/2026.

## Contexto

O código mistura **pt-BR e inglês** nos identificadores, sem critério:
`mes`, `ano`, `contasMes`, `valor`, `observacoes`, `carregarAuxiliares` (pt-BR) ao lado de `items`, `options`, `loading`, `sales`, `showToast`, `loadSales` (inglês). Também há diferenças de aspas e estilos entre arquivos.

A mistura prejudica a legibilidade, a busca e a manutenção — e dificulta a refatoração em andamento (`docs/ALIGNMENT.md`).

## Decisão

**Identificadores, funções e nomes de arquivo em inglês** (idioma da stack e da maioria do código); **pt-BR apenas em strings visíveis ao usuário** (mensagens, labels, placeholders), pois o público é o dono, falante de pt-BR.

- Aplicação **gradual**: código novo e código refatorado/extraído já nasce em inglês; os identificadores pt-BR restantes são renomeados **ao tocar** nos módulos (evita renames massivos e arriscados fora de contexto).
- Exemplos já aplicados: `src/utils/toast.ts`, `clipboard.ts`, `download.ts`, `qrPix.ts`, `pixActions.ts`, `productPrice.ts` (após renome de `produtoPreco.ts` com `calcularPrecoVenda`/`calcularMargem` → `calculateSalePrice`/`calculateMargin`).
- Comentários/docstrings seguem a linguagem do contexto predominante (pt-BR para regras de negócio, inglês para código genérico é aceitável), mas **identificadores são sempre inglês**.

## Consequências

**Positivas:**
- Padrão único e consistente com a stack; busca e leitura de código mais rápidas.
- Elimina ambigüidade ao extrair hooks/serviços (a refatoração já produz nomes em inglês).

**Negativas / aceitas:**
- Renomeação incremental deixa o código transitório (pt-BR + inglês) por algum tempo.
- Custos de `git blame`/histórico nas renomeações — mitigados por tratar-se de iniciativa de refatoração.

## Alternativas consideradas

- **pt-BR em tudo:** coerente com o idioma do negócio, porém diverge da stack/API e exigiria renomear a maioria dos identificadores existentes (maior custo e risco).
- **Manter mistura sem regra:** rejeitado — era exatamente o problema.

## Atualização (22/10/2026)

- O dono solicitou **varredura completa** de funções e parâmetros para inglês, substituindo nesta rodada a aplicação apenas incremental prevista acima.
- Renomeados exports, hooks, componentes, handlers e funções auxiliares em todas as camadas, além dos parâmetros de função (`mes`→`month`, `ano`→`year`, `valor`→`amount`, `nome`→`name`, `descricao`→`description`, `itens`→`items`, …).
- **Fora do escopo**: propriedades de contrato de dados (JSON/SQL/query params como `distribuidora`, `valor`, `vencimento`, `documento`, `banco_observacoes`, `mes`, `ano`, `filtro`, `itens`) permanecem em pt-BR para não quebrar API/banco.
- A regra de aplicação gradual continua valendo para o futuro; a varredura cobre o legado restante identificado por AST.

## Atualização (22/10/2026, segunda rodada)

- **Tipos/interfaces e props de UI** agora seguem o mesmo padrão: `ContaDetalhe`→`AccountDetails`, `VendaDiaria`→`DailySale`, `ProdutoFormData`→`ProductFormData`, `FiltrosState`→`ProductFiltersState`, `SugestaoItem`→`SuggestionItem`, entre outros.
- Props de componentes, parâmetros de hooks, modelos de formulário/options/actions e campos de view-model passaram para inglês (ex.: `contasAno`→`accountsYear`, `filtroDistribuidora`→`distributorFilter`, `precoVenda`→`salePrice`, `quantidade`→`quantity`).
- **Preservado** apenas o contrato de dados exposto por API/SQL/JSON (`ItemData.nome`/`tipo`/`estoque`, `AccountDetails.distribuidora`/`valor`/`vencimento`, `DailySale.valor`, …), além de textos/IDs visíveis ao usuário.
- Verificação: `npx tsc --noEmit` verde; docs espelhados atualizados.

## Referências

- `AGENTS.md` → "Framework e boas práticas" (regra de nomenclatura).
- `docs/ALIGNMENT.md` §4 (direção da refatoração).
- `docs/documentation-guidelines.md` (padrão de documentação).