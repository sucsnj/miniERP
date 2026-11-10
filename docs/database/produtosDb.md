# `src/database/produtosDb.ts`

## Descrição

Módulo de persistência do catálogo em `db/produtos.db` (SQLite via `better-sqlite3`). Gerencia produtos, serviços, categorias, marcas, fornecedores, unidades de medida, códigos de barras, unidades alternativas e movimentações de estoque.

## Contexto

Usado pelos endpoints em `src/pages/api/produtos*` e pela importação de XML NF-e (`itens.ts`). É o banco mais "padrão relacional" do projeto (joins e FKs ativas).

## Configuração da conexão

- `journal_mode = WAL`, `synchronous = FULL`, `foreign_keys = ON`.
- Na abertura, roda migrations idempotentes (criação de tabelas, ALTERs de colunas, migração de `itens_legacy`).

## Tabelas

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `categorias` | `id`, `nome` (UNIQUE), `descricao` | `id=1` é "Geral" |
| `marcas` | `id`, `nome` (UNIQUE) | `id=1` é "Outros" |
| `fornecedores` | `id`, `nome` (UNIQUE) | `id=1` é "Sem fornecedor" |
| `unidades_medida` | `id`, `sigla` (UNIQUE), `descricao` | `id=1` é "UN" |
| `itens` | `id`, `tipo` (só `PRODUTO`), `nome`, `descricao`, `categoria_id`, `unidade_medida_id`, `marca_id`, `fornecedor_id`, `preco_compra`, `margem_lucro`, `preco_venda`, `estoque`, `multiplicador_unidade`, `codigo_interno` (UNIQUE), `referencia` (UNIQUE), `ativo`, `data_criacao`, `data_atualizacao` | Produtos (serviços vivem em `servicos`) |
| `item_codigos_barras` | `item_id` (FK CASCADE), `codigo_barras` (UNIQUE), `principal` | |
| `item_unidades_medida` | `item_id` (FK CASCADE), `unidade_medida_id`, `multiplicador_unidade`, `principal`, `UNIQUE(item_id, unidade_medida_id)` | Unidades alternativas |
| `servicos` | `id`, `nome`, `descricao`, `categoria_id`, `preco_venda`, `codigo_interno` (UNIQUE), `referencia`, `duracao_minutos`, `data_criacao`, `data_atualizacao` | |
| `movimentacoes_estoque` | `id`, `item_id` (FK CASCADE), `item`, `tipo` (`ENTRADA`/`SAIDA`/`AJUSTE`), `quantidade`, `estoque_final`, `descricao`, `data_movimentacao` | Histórico de estoque |

## Assinaturas (seleção)

```ts
export const getCategorias: () => any[];
export const getCategoriaById: (id: number) => any;
export const insertCategoria: (nome: string, descricao?: string) => RunResult;
export const deleteCategoria: (id: number) => RunResult;          // lança se id=1 (Geral)
export const updateCategoria: (id: number, nome: string, descricao?: string) => RunResult;

export const getMarcas: () => any[];
export const getMarcaById: (id: number) => any;
export const insertMarca: (nome: string) => RunResult;
export const deleteMarca: (id: number) => RunResult;              // lança se id=1 (Outros)
export const updateMarca: (id: number, nome: string) => RunResult;

export const getFornecedores: () => any[];
export const getFornecedorById: (id: number) => any;
export const insertFornecedor: (nome: string) => RunResult;
export const deleteFornecedor: (id: number) => RunResult;         // lança se id=1 (Sem fornecedor)
export const updateFornecedor: (id: number, nome: string) => RunResult;

export const getUnidadesMedida: () => any[];
export const getUnidadeMedidaById: (id: number) => any;
export const insertUnidadeMedida: (sigla: string, descricao?: string) => RunResult;
export const updateUnidadeMedida: (id: number, sigla: string, descricao?: string) => RunResult; // lança se sigla em seedUoms
export const deleteUnidadeMedida: (id: number) => RunResult;      // lança se id=1 (UN)

export const getItens: (options: {
  search?: string; categoria_id?: number; marca_id?: number; fornecedor_id?: number;
  ativo?: number; page?: number; pageSize?: number;
}) => { items: any[]; total: number; page: number; pageSize: number; totalPages: number };

export const getItemById: (id: number) => any;   // item + codigos_barras + unidades_medida
export const getItemByBarcode: (barcode: string) => any | undefined;
export const insertItem: (itemData: ItemInput) => number;         // transação; gera ENTRADA p/ estoque inicial
export const updateItem: (id: number, itemData: ItemInput) => boolean; // transação; gera AJUSTE se estoque mudou
export const deleteItem: (id: number) => RunResult;
export const toggleItemStatus: (id: number, ativo: number) => RunResult;

export const checkDuplicateCodigoInterno: (codigoInterno: string, excludeId?: number) => boolean;
export const checkDuplicateBarcode: (barcodes: string[], excludeItemId?: number) => string | null;

export const getServicos: (options: {
  search?: string; categoria_id?: number; ativo?: number; page?: number; pageSize?: number;
}) => { services: ServicoData[]; total: number; page: number; pageSize: number; totalPages: number };
export const getServicoById: (id: number) => ServicoData | undefined;
export const insertServico: (servicoData: ServicoInput) => number;  // transação; hashCode interno auto
export const updateServico: (id: number, servicoData: ServicoInput) => boolean;
export const deleteServico: (id: number) => RunResult;

export const insertMovimentacaoEstoque: (movement: MovimentacaoEstoqueInput) => RunResult; // transação
export const getMovimentacoesEstoque: (itemId: number) => MovimentacaoEstoqueData[];

export default db;
```

### Interfaces principais

```ts
interface ServicoData {
  id: number; nome: string; descricao?: string; categoria_id: number;
  preco_venda: number; codigo_interno?: string; referencia?: string;
  duracao_minutos: number; data_criacao: string; data_atualizacao: string;
  categoria_nome?: string;
}

interface ServicoInput {
  nome: string; descricao?: string; categoria_id: number; preco_venda: number;
  codigo_interno?: string; referencia?: string; duracao_minutos?: number;
}

interface MovimentacaoEstoqueData {
  id: number; item_id: number; item: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'; quantidade: number;
  estoque_final: number; descricao?: string; data_movimentacao: string;
}

interface MovimentacaoEstoqueInput {
  item_id: number; tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'; quantidade: number; descricao?: string;
}

interface ItemInput {
  tipo: 'PRODUTO'; nome: string; descricao?: string; categoria_id: number;
  unidade_medida_id: number; marca_id: number; fornecedor_id: number;
  preco_compra: number; margem_lucro: number; preco_venda: number; estoque: number;
  multiplicador_unidade: number; codigo_interno?: string; referencia?: string | null;
  ativo?: number; codigos_barras?: BarcodeData[]; unidades_medida?: ItemUnidadeData[];
}

interface ItemUnidadeData {
  unidade_medida_id: number; multiplicador_unidade: number; principal: number;
  sigla?: string; descricao?: string;   // preenchidos ao resolver o JOIN com unidades_medida
}
```

## Regras de estoque (movimentações)

- `insertMovimentacaoEstoque` é `db.transaction`: valida item existente, tipo (`ENTRADA`/`SAIDA`/`AJUSTE`) e quantidade; recalcula `estoque_final = estoque_atual + qtd` (SAIDA subtrai); atualiza `itens.estoque` e insere registro com `datetime('now', 'localtime')`.
- `ENTRADA`/`SAIDA` exigem `quantidade > 0`; `AJUSTE` exige `quantidade !== 0`.
- `insertItem` inicia estoque em 0 e, se `estoque > 0`, registra `ENTRADA` "Estoque inicial via cadastro".
- `updateItem` compara estoque atual vs. objetivo; se diferente, registra `AJUSTE` "Ajuste via cadastro" (com a diferença a mais/menos).

## Seeding

- No startup, semeadura automática e idempotente de `unidades_medida`, `categorias`, `marcas` e `fornecedores` (funções de `./seeds`) quando as tabelas estão vazias.

## Observações

- `syncSharedAutoincrementSequence()` sincroniza a sequência AUTOINCREMENT entre `itens` e `servicos` — produtos e serviços compartilham o mesmo espaço de IDs (serviços recebem `codigo_interno` igual ao próprio ID quando deixado em branco).
- Migração histórica: `itens` já aceitou `tipo='SERVICO'`; o código reconstrói a tabela (`itens_legacy` → nova `itens`) removendo serviços e mantendo apenas `PRODUTO`.
- Existe `CREATE TABLE servicos` duplicado no mesmo `db.exec` (redeclaração intencional? aparecem duas definições idênticas nos fontes) — inofensiva pois é `IF NOT EXISTS`, mas merece revisão.
- O `checkbox ativo` foi removido da tabela `servicos` (DROP COLUMN aplicado de forma compatível).
- `DTO`s de `produtosDb` usam `any` em muitos retornos (categorias, marcas, itens) apesar de existirem interfaces `ServicoData`/`MovimentacaoEstoqueData`. Navios tipos são redefinidos também em `produtosService.ts`.