# `src/database/salesRepository.ts`

> Repositório de vendas, itens de venda, consolidação mensal e estoque relacionado sobre o Supabase/Postgres. Substitui `db.ts` nas rotas migradas da Fase 3.

## O que faz

- PostgreSQL: `sales.idempotency_key` (UUID opcional) fica fora de rows legadas e possui índice único parcial por `(company_id, store_id, idempotency_key)`.
- Usa o cliente server-only `getSupabaseServerClient()` (`src/database/supabase.ts`).
- Lista, cria, atualiza e exclui vendas diárias (via RPCs `create_sale`, `update_sale`, `delete_sale`), aplicando movimentações de estoque automaticamente; `create_sale` aceita `p_idempotency_key` e retorna o UUID existente em retry.
- Lista itens de uma venda e totais/consolidações mensais.
- Consolida mês (`consolidateMonthly`) e exclui consolidação (`deleteMonthlySale`).
- Integra com `productsRepository` via IDs UUID de produtos/serviços.
- A partir da ADR 0013 Fase 3, as funções recebem `AuthContext` e filtram/escrevem por `company_id`/`store_id`; RPCs recebem o mesmo tenant explicitamente.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/env.ts`
- **Usado por:** `src/pages/api/vendas.ts`, `src/pages/api/venda-itens.ts`, `src/pages/api/mensais.ts`

## Notas

- Datas de negócio em `date`; valores monetários em `numeric(14,2)`.
- A consolidação mensal é calculada a partir das vendas do mês e persistida em `monthly_sales`.
