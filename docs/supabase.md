# Supabase — guia de integração

> Banco oficial do ERP a partir da migração registrada no ADR 0012. Substitui os cinco bancos SQLite locais. Este guia cobre aplicação do schema, convenções e operação; o estado das fases fica em `PROJECT_STATUS.md`.

## Aplicar o schema

1. Crie (ou abra) o projeto no painel do Supabase.
2. Abra **SQL Editor** e cole o conteúdo de `supabase/schema.sql`.
3. Execute uma vez. O script é idempotente (`if not exists` / `on conflict`), então pode ser reaplicado com segurança.
4. Confira em **Table Editor** as 15 tabelas e os seeds:
   - `categories` → `Geral` (`is_default`, `is_system`).
   - `brands` → `Outros`.
   - `suppliers` → `Sem fornecedor`.
   - `units_of_measure` → 21 unidades, `UN` como default.
5. Confira em **Database → Functions** as RPCs listadas abaixo.

## Variáveis de ambiente

Já presentes no `.env.local` (e devem ser configuradas na Vercel):

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave **somente servidor** usada pelas API routes. Nunca expor no browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Reservada para acesso client-side futuro; não usada nesta fase. |

A validação é centralizada em `src/utils/env.ts` e falha na primeira leitura se `NEXT_PUBLIC_SUPABASE_URL` (URL http/https) ou `SUPABASE_SERVICE_ROLE_KEY` estiverem ausentes/inválidas.

## Convenções do banco

- Schema único: `public`.
- Nomes em inglês `snake_case`; chaves `uuid` (`gen_random_uuid()`).
- Dinheiro `numeric(14,2)`; quantidade `numeric(14,3)`; estoque `integer`.
- Datas de negócio `date`; auditoria `timestamptz` (`created_at`, `updated_at`).
- Enums de baixa cardinalidade em `text` + `CHECK` (`PRODUCT|SERVICE`, `PENDING|PAID`, `IN|OUT|ADJUST`).
- `is_default` = registro de fallback; `is_system` = seed protegido contra edição/exclusão.
- `updated_at` é atualizado por trigger `set_updated_at`.

## Tabelas

| Domínio | Tabelas |
| --- | --- |
| Vendas | `sales`, `sale_items`, `monthly_sales` |
| Catálogo | `categories`, `brands`, `suppliers`, `units_of_measure`, `products`, `product_barcodes`, `product_units`, `services` |
| Estoque | `stock_movements` |
| Contas | `payables`, `invoices` |
| Tabela de medicamentos | `medicine_search_history` |

## RPCs

| RPC | Para que serve |
| --- | --- |
| `apply_stock_movement` | Atualiza `products.stock` e grava `stock_movements` atomicamente. |
| `create_sale` | Cria venda + itens + saída de estoque dos produtos. |
| `update_sale` | Atualiza venda/itens + reconcilia diferenças de estoque. |
| `delete_sale` | Exclui a venda (itens caem por cascade; não devolve estoque). |
| `create_product` / `update_product` | Produto + códigos de barras + unidades + estoque inicial/ajuste. |
| `delete_product` | Exclui produto (dependências em cascade). |
| `create_service` / `update_service` / `delete_service` | CRUD de serviços com código interno automático. |
| `delete_category` / `update_category` | Protege seeds e repõe produtos/serviços na categoria default. |
| `delete_brand` / `update_brand` | Protege seed e repõe produtos na marca default. |
| `delete_supplier` / `update_supplier` | Protege seed e repõe produtos no fornecedor default. |
| `delete_unit_of_measure` / `update_unit_of_measure` | Protege seeds e repõe produtos/unidades na unidade default. |
| `save_medicine_search` | Upsert do histórico + poda para os 25 mais recentes. |
| `list_products` / `list_services` | Listagens com busca, filtros, joins e paginação em `jsonb`. |

## Segurança

- RLS habilitado em todas as tabelas **sem policies**: `anon`/`authenticated` não leem nem escrevem.
- O app usa a `service role` somente no servidor (API routes). Se um dia o cliente acessar o banco direto, será preciso criar policies e autenticação.
- `revoke` explícito de tabelas/sequences/funções para `anon`/`authenticated`; `execute` concedido a `service_role`.

## Vercel

- O Supabase elimina a restrição do SQLite; as API routes com `service role` funcionam em serverless.
- OCR/PDF será removido (ADR 0012). O upload XLSX de `/medicine-table` usa `multer` em `uploads/` e precisará gravar em `/tmp` ou Supabase Storage.
- Autenticação/proteção do app fica para uma fase posterior.

## Estado da migração

- Fase 0: ADR 0012.
- Fase 1: `supabase/schema.sql`.
- Fase 2: `src/database/supabase.ts` (client server-only) + `src/utils/env.ts` (validação de env).
- Próximas: repositories por domínio, renomeação ponta a ponta, limpeza do SQLite/OCR/backups.
