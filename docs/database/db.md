# `src/database/db.ts`

## Descrição

Módulo principal de persistência de vendas. Abre a conexão SQLite com `better-sqlite3` no arquivo `db/vendas.db` e expõe operações de vendas diárias, itens de venda e consolidação mensal.

## Conexão e configuração

- Caminho: `db/vendas.db` (via `process.cwd()`).
- Pragmas: `journal_mode = WAL`, `synchronous = FULL`, `foreign_keys = ON`.

## Tabelas

### `vendas_diarias`

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `data` | TEXT | data da venda (`YYYY-MM-DD`) |
| `valor` | REAL | valor registrado (positivo ou negativo) |
| `observacoes` | TEXT | nullable |
| `carrinho_id` | INTEGER | nullable, adicionado via migração |
| `criado_em` | DATETIME | default `CURRENT_TIMESTAMP` |

### `venda_itens`

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `venda_id` | INTEGER | FK → `vendas_diarias(id)` ON DELETE CASCADE |
| `item_id` | INTEGER | id do produto/serviço no catálogo; nullable |
| `tipo` | TEXT | `'PRODUTO'` ou `'SERVICO'` |
| `nome` | TEXT | |
| `quantidade` | REAL | default 1 |
| `preco_unitario` | REAL | default 0 |
| `subtotal` | REAL | default 0 |
| `codigo_interno` | TEXT | nullable |
| `referencia` | TEXT | nullable |
| `criado_em` | DATETIME | default `CURRENT_TIMESTAMP` |

### `vendas_mensais`

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `mes` / `ano` | INTEGER | `UNIQUE(mes, ano)` |
| `ticketMedio` | REAL | default 0 |
| `mediaClientes` / `mediaClientesEsp` | INTEGER | default 0 |
| `melhorDia` | TEXT | default `'N/A'` |
| `melhorDiaValor` | REAL | default 0 |
| `maiorVenda` | REAL | default 0 |
| `qtdVendas` / `qtdVendasEsp` | INTEGER | default 0 |
| `total` / `totalEsp` | REAL | obrigatório |

## Funções Principais

### Vendas diárias

- `insertDailySale(data: string, valor: number, observacoes?: string, criado_em?: string, carrinho_id?: number | null)` → insere em `vendas_diarias`; usa timestamp local se `criado_em` não for informado.
- `getDailySales(mes: number, ano: number, filtro?: 'positivas' | 'negativas' | 'todas')` → vendas do mês ordenadas por `data DESC`; `positivas` filtra `valor > 0`, `negativas` filtra `valor <= 0`.
- `getDailySaleById(id: number)` → venda por id.
- `updateDailySale(id, data, valor, observacoes?)` → atualiza data/valor/observações (não altera `carrinho_id`).
- `deleteDailySale(id)` → exclui os itens da venda e depois a venda.

### Itens de venda

- `insertVendaItens(vendaId: number, itens: VendaItemInput[])` → insere em lote (transação); `subtotal` calculado como `preco_unitario * quantidade` quando não informado.
- `getVendaItens(vendaId: number): VendaItemData[]` → itens da venda por `id ASC`.
- `deleteVendaItens(vendaId: number)` → remove os itens da venda.

### Mensal

- `getMonthlyTotal(mes, ano)` → linha de `vendas_mensais` do mês (ou `undefined`).
- `consolidateMonthly(mes, ano)` → calcula métricas (`ticketMedio`, `mediaClientes`, `melhorDia`, `maiorVenda`, `qtdVendas`, totais etc.) a partir das vendas diárias e grava com `INSERT OR REPLACE`.
- `getAllMonthly()` → todos os mensais, `ano DESC, mes DESC`.
- `deleteMonthly(id)` → exclui registro mensal.

### Backup

- `backupDatabase()` → gera `backup-<YYYY-MM-DD>.db` na raiz do projeto via `db.backup()`.

## Interfaces

- `VendaItemInput` — `{ item_id?, tipo: 'PRODUTO'|'SERVICO', nome, quantidade, preco_unitario, subtotal?, codigo_interno?, referencia? }`.
- `VendaItemData` — `VendaItemInput` + `id`, `venda_id`, `subtotal`, `criado_em`.

## Observações

- O timestamp local (`criado_em`) usa `now()` de `src/utils/date` (timezone `America/Recife`).
- Existe **divergência de documentação**: `docs/CONTEXT.md` e `AGENTS.md` citavam o banco como `db.db`; o arquivo real é `db/vendas.db`. Corrigido nesta revisão.
- O backup é gravado na raiz do projeto (`backup-YYYY-MM-DD.db`), não dentro de `db/`.