# ADR 0012 — Migração do SQLite local para Supabase (Postgres)

- **Status:** aceito (09/11/2026).
- **Decisores:** dono do projeto + agente de IA.
- **Data:** 09/11/2026.

## Contexto

A aplicação persiste tudo em cinco bancos SQLite locais (`vendas.db`, `contas.db`, `notas.db`, `tabela.db`, `produtos.db`) via `better-sqlite3`. O banco local impede deploy em serverless (Vercel), não tem backups gerenciados, usa `REAL` para dinheiro, nomes em pt-BR e uma sequência compartilhada improvisada entre `itens` e `servicos`. O `db/` local está vazio (apenas `.gitkeep`), então não há dados a migrar. As chaves do Supabase já existem no `.env.local`. O fluxo de OCR/PDF depende de binários nativos (GraphicsMagick/Ghostscript) incompatíveis com Vercel e será eliminado.

## Decisão

1. **Um projeto Supabase, schema `public` único.** Todas as tabelas do ERP ficam em `public`, em um só banco Postgres.
2. **Acesso somente pelo servidor.** `src/pages/api` usa `@supabase/supabase-js` com a `service role` key. O frontend nunca fala com o banco; a chave publishable não é usada nesta fase. RLS habilitado em todas as tabelas **sem policies** (nega `anon`/`authenticated`; `service_role` ignora RLS).
3. **Nomenclatura em inglês ponta a ponta.** Tabelas/colunas em `snake_case` inglês; tipos, APIs, serviços, hooks e componentes também em inglês. Strings visíveis ao usuário continuam em pt-BR (ADR 0004).
4. **UUID como chave primária.** `uuid` gerado por `gen_random_uuid()` em todas as tabelas. Isso elimina a sequência compartilhada entre `itens` e `servicos`.
5. **Tipos corretos.** Dinheiro em `numeric(14,2)`; quantidades em `numeric(14,3)`; estoque `integer`; datas de negócio em `date`; timestamps em `timestamptz`; enums de baixa cardinalidade em `text` + `CHECK`; JSON em `jsonb`.
6. **Transações via RPC.** Operações compostas são funções Postgres chamadas por `supabase.rpc()`: `create_sale`, `update_sale`, `create_product`, `update_product`, `apply_stock_movement`, `create_service`, `update_service`, `delete_*` dos cadastros protegidos e `save_medicine_search`.
7. **Produtos e serviços separados.** Mantidas tabelas `products` e `services`; com UUID não há colisão de IDs.
8. **Cadastros padrão protegidos por flags.** `is_default` identifica o registro de fallback (Geral/Outros/Sem fornecedor/UN) e `is_system` protege os seeds de edição/exclusão.
9. **Sem dados a migrar.** O schema nasce vazio e recebe apenas os seeds padrão.
10. **Backups locais removidos.** Endpoints `/api/backup`, `/api/contas/backup`, serviços e botões de backup `.db` serão excluídos; backup passa a ser responsabilidade do Supabase (dashboard/PITR).
11. **OCR/PDF removido.** `pdf2pic`, `tesseract.js`, `sharp`, endpoint `/api/ocr`, serviços e componentes de OCR serão excluídos. O upload XLSX da tabela de medicamentos permanece e será adaptado a `/tmp`/Vercel em fase própria.
12. **Entrega do schema.** Os SQLs ficam em `supabase/schema.sql` e são aplicados manualmente no SQL Editor do Supabase (sem Supabase CLI nesta fase).

## Mapa de nomes (legado → novo)

| Legado | Novo |
| --- | --- |
| `vendas_diarias` | `sales` (`sale_date`, `amount`, `notes`, `created_at`) |
| `venda_itens` | `sale_items` (`kind`, `product_id`, `service_id`, `name`, `quantity`, `unit_price`, `subtotal`, `internal_code`, `reference`) |
| `vendas_mensais` | `monthly_sales` (`month`, `year`, `average_ticket`, `average_customers`, `best_day`, `total`, …) |
| `contas_detalhes` | `payables` (`supplier_name`, `amount`, `due_date`, `document`, `status` `PENDING|PAID`, `bank_notes`) |
| `notas_detalhes` | `invoices` (`supplier_name`, `access_key`, `issue_date`, `amount`) |
| `tabela_search_history` | `medicine_search_history` (`query`, `normalized_query`, `results` jsonb, `result_count`) |
| `categorias` | `categories` |
| `marcas` | `brands` |
| `fornecedores` | `suppliers` |
| `unidades_medida` | `units_of_measure` (`abbreviation`, `description`) |
| `itens` | `products` (`base_unit_id`, `unit_multiplier`, `stock`, `active`) |
| `item_codigos_barras` | `product_barcodes` (`barcode`, `is_primary`) |
| `item_unidades_medida` | `product_units` (`unit_id`, `unit_multiplier`, `is_primary`) |
| `servicos` | `services` (`duration_minutes`) |
| `movimentacoes_estoque` | `stock_movements` (`product_id`, `product_name`, `type` `IN|OUT|ADJUST`, `quantity`, `final_stock`, `moved_at`) |

Contratos de API/UI seguem o mesmo padrão: `mes/ano` → `month/year`, `valor` → `amount`, `data` → `date`, `observacoes` → `notes`, `itens` → `items`, `tipo` → `kind` (`PRODUCT|SERVICE`), `nome` → `name`, `quantidade` → `quantity`, `preco_venda` → `salePrice`, `preco_unitario` → `unitPrice`, `codigo_interno` → `internalCode`, `referencia` → `reference`, `distribuidora` → `supplierName`, `vencimento` → `dueDate`, `documento` → `document`, `chave` → `accessKey`, `data_emissao` → `issueDate`, `categoria_id` → `categoryId`, `marca_id` → `brandId`, `fornecedor_id` → `supplierId`, `unidade_medida_id` → `baseUnitId`, `preco_compra` → `purchasePrice`, `margem_lucro` → `profitMargin`, `estoque` → `stock`, `multiplicador_unidade` → `unitMultiplier`, `codigos_barras` → `barcodes`, `unidades_medida` → `units`.

## Fases

0. **Decisões + ADR** (esta entrega).
1. **Schema SQL** em `supabase/schema.sql`: tabelas, índices, seeds, RPCs, RLS (esta entrega).
2. **Infra de acesso**: instalar `@supabase/supabase-js`, cliente server-only, validação de env, remoção planejada do `better-sqlite3`.
3. **Domínios, um por pausa**: vendas/estoque → catálogo → contas/notas → tabela de medicamentos → consolidação mensal. Em cada um: repository + API + service + frontend renomeados.
4. **Limpeza**: excluir `db/`, `better-sqlite3`, backups e OCR; atualizar docs espelhados e `PROJECT_STATUS`.
5. **Vercel**: env vars, upload XLSX em `/tmp`, validação de deploy (auth fica para depois).

## Consequências

**Positivas:**

- Banco remoto gerenciado, com backup/PITR e acesso concorrente.
- Deploy em Vercel viável (sem SQLite/nativos no caminho crítico).
- Tipos corretos (dinheiro/datas), integridade referencial real e operações atômicas via RPC.
- Nomenclatura consistente e sem legado pt-BR no código/banco.

**Negativas / aceitas:**

- Renomear ponta a ponta toca quase todas as camadas (fases longas).
- `supabase-js` não abre transação arbitrária; por isso as operações compostas viram RPC.
- RPCs concentram regra no banco e exigem versionamento manual (SQL no Dashboard).
- Sem autenticação, o deploy público continua exposto; será tratado depois.

## Alternativas consideradas

- **Cliente direto no frontend com RLS:** exigiria autenticação/políticas e reescrever serviços; adiado.
- **Conexão Postgres direta (`pg`/`postgres.js`):** daria SQL/transação livre, mas exigiria `DATABASE_URL`/senha e cuidado com pooler em serverless; RPC usa só as chaves já disponíveis.
- **Manter nomes pt-BR:** menor esforço, mas perpetua o legado contrariando o pedido.
- **UUID vs bigint:** UUID remove a sequência compartilhada e é o padrão Supabase; custo é renomear tipos/IDs em todas as camadas.
- **Unificar produtos e serviços:** simplificaria `sale_items`, mas o dono optou por manter as tabelas separadas.

## Referências

- `supabase/schema.sql`
- `docs/supabase.md`
- `docs/adr/0004-padrao-de-nomenclatura-dos-identificadores.md`
- `docs/adr/0011-integracao-carrinho-estoque.md`
- `src/database/db.ts`, `src/database/contasDb.ts`, `src/database/notasDb.ts`, `src/database/medicine-tableDb.ts`, `src/database/productsDb.ts`
- `src/pages/api/vendas.ts`, `src/pages/api/products/items.ts`
