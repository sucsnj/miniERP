# Supabase — guia de integração

> Banco oficial do ERP a partir da migração registrada no ADR 0012. Substitui os cinco bancos SQLite locais. Este guia cobre aplicação do schema, convenções e operação; o estado das fases fica em `PROJECT_STATUS.md`.

## Aplicar o schema

1. Crie (ou abra) o projeto no painel do Supabase.
2. Abra **SQL Editor** e cole o conteúdo de `supabase/schema.sql`.
3. Execute uma vez. O script é idempotente (`if not exists` / `on conflict`) para criação de tabelas/índices; RPCs são resubstituídas por `create or replace`.
4. Confira em **Table Editor** os tenants (`companies`, `stores`, `users`, `user_stores`, `sessions`, `company_settings`) e as tabelas de negócio. Não há seed global: o primeiro admin cria/adota a empresa e recebe os cadastrais padrão atomicamente via `bootstrap_company_admin`.
5. Para banco pré-ADR 0013, aplique `supabase/migrations/0013-auth-multi-tenant.sql` após backup completo. O script atribui dados legados a uma empresa `Empresa legada`, cria loja `Loja principal` e prepara as constraints multi-loja.
5.1. Se aparecer `PGRST202` para `bootstrap_company_admin`, aplique `supabase/migrations/0014-fix-bootstrap-company-admin.sql` no SQL Editor e confirme a função em Database → Functions.
5.2. Para foto na navbar, aplique `supabase/migrations/0016-add-user-avatar-url.sql`; a coluna `users.avatar_url` é opcional e o frontend usa inicial do nome quando não há foto.
5.3. Para salvar presets de PIX na empresa, aplique `supabase/migrations/0017-add-pix-presets-to-company-settings.sql`; a coluna `company_settings.pix_presets` guarda um JSON compartilhado por empresa.
6. Confira em **Database → Functions** as RPCs listadas abaixo.

## Variáveis de ambiente

Já presentes no `.env.local` (e devem ser configuradas na Vercel):

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave **somente servidor** usada pelas API routes. Nunca expor no browser. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Reservada para acesso client-side futuro; não usada nesta fase. |
| `PIN_MASTER` | Bootstrap do primeiro admin; somente servidor. Exigida a partir da Fase 2 (auth core). |

A validação é centralizada em `src/utils/env.ts` e falha na primeira leitura se `NEXT_PUBLIC_SUPABASE_URL` (URL http/https) ou `SUPABASE_SERVICE_ROLE_KEY` estiverem ausentes/inválidas.

## Convenções do banco

- Schema único: `public`.
- Nomes em inglês `snake_case`; chaves `uuid` (`gen_random_uuid()`).
- **Multiempresa:** toda tabela de negócio possui `company_id`; dados são invisíveis a outros tenants.
- **Multi-loja:** `sales` e `monthly_sales` também possuem `store_id`; cadastrais são compartilhados no escopo da empresa.
- Dinheiro `numeric(14,2)`; quantidade `numeric(14,3)`; estoque `integer`.
- Datas de negócio `date`; auditoria `timestamptz` (`created_at`, `updated_at`).
- Enums de baixa cardinalidade em `text` + `CHECK` (`PRODUCT|SERVICE`, `PENDING|PAID`, `IN|OUT|ADJUST`).
- `is_default` = registro de fallback; `is_system` = seed protegido contra edição/exclusão.
- `updated_at` é atualizado por trigger `set_updated_at`.

## Tabelas

| Domínio | Tabelas |
| --- | --- |
| Tenant | `companies`, `stores`, `users`, `user_stores`, `sessions`, `company_settings` |
| Vendas | `sales`, `sale_items`, `monthly_sales` |
| Catálogo | `categories`, `brands`, `suppliers`, `units_of_measure`, `products`, `product_barcodes`, `product_units`, `services` |
| Estoque | `stock_movements` |
| Contas | `payables`, `invoices` |
| Tabela de medicamentos | `medicine_search_history` |

## RPCs

| RPC | Para que serve |
| --- | --- |
| `bootstrap_company_admin` | Reivindica tenant legado sem usuários ou cria empresa/loja/settings/admin atomicamente; usado somente no primeiro bootstrap. |
| `apply_stock_movement` | Atualiza `products.stock` e grava `stock_movements` atomicamente; filtra por `company_id`. |
| `create_sale` | Cria venda + itens + saída de estoque dos produtos; exige `company_id`/`store_id`. |
| `update_sale` | Atualiza venda/itens + reconcilia diferenças de estoque; exige `company_id`/`store_id`. |
| `delete_sale` | Exclui a venda no tenant/loja informados (itens caem por cascade; não devolve estoque). |
| `create_product` / `update_product` | Produto + códigos de barras + unidades + estoque inicial/ajuste. |
| `delete_product` | Exclui produto (dependências em cascade). |
| `create_service` / `update_service` / `delete_service` | CRUD de serviços com código interno automático. |
| `delete_category` / `update_category` | Protege seeds e repõe produtos/serviços na categoria default. |
| `delete_brand` / `update_brand` | Protege seed e repõe produtos na marca default. |
| `delete_supplier` / `update_supplier` | Protege seed e repõe produtos no fornecedor default. |
| `delete_unit_of_measure` / `update_unit_of_measure` | Protege seeds e repõe produtos/unidades na unit default. |
| `save_medicine_search` | Upsert do histórico + poda para os 25 mais recentes. |
| `list_products` / `list_services` | Listagens com busca, filtros, joins e paginação em `jsonb`; exigem `company_id`. |

Todas as RPCs de negócio foram alteradas para operar com `company_id` (e `store_id` onde aplicável), validando o tenant antes de consultar/alterar dados.

## Segurança

- RLS habilitado em todas as tabelas **sem policies**: `anon`/`authenticated` não leem nem escrevem.
- O app usa a `service role` somente no servidor (API routes). Se um dia o cliente acessar o banco direto, será preciso criar policies e autenticação.
- Tenant isolation é aplicada server-side: API routes/repositories/RPCs recebem `company_id`/`store_id` da sessão, nunca do cliente livre.
- `revoke` explícito de tabelas/sequences/funções para `anon`/`authenticated`; `execute` concedido a `service_role`.
- `PIN_MASTER`, sessões e hashes de senha nunca são `NEXT_PUBLIC_*`.

## Vercel

- O Supabase elimina a restrição do SQLite; as API routes com `service role` funcionam em serverless.
- OCR/PDF será removido (ADR 0012). O upload XLSX de `/medicine-table` usa `multer` em `uploads/` e precisará gravar em `/tmp` ou Supabase Storage.
- Autenticação própria e multiempresa/multi-loja são definidas no ADR 0013; schema e proteção server-side ficam em rollout pausado.

## Estado da migração

- Fase 5: Vercel (variáveis de ambiente, upload XLSX em `/tmp`/Storage).
- ADR 0013 Fase 1: schema multi-tenant, `bootstrap_company_admin` e migration `supabase/migrations/0013-auth-multi-tenant.sql`.
- Próximas ADR 0013: auth core, tenant enforcement nas APIs, permissões, UI e settings por empresa.
