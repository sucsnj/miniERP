# `src/database/salesRepository.ts`

> Repositório de vendas, itens de venda, consolidação mensal e estoque relacionado sobre o Supabase/Postgres. Substitui `db.ts` nas rotas migradas da Fase 3.

## O que faz

- Usa o cliente server-only `getSupabaseServerClient()` (`src/database/supabase.ts`).
- Lista, cria, atualiza e exclui vendas diárias (via RPCs `create_sale`, `update_sale`, `delete_sale`), aplicando movimentações de estoque automaticamente.
- Lista itens de uma venda e totais/consolidações mensais.
- Consolida mês (`consolidateMonthly`) e exclui consolidação (`deleteMonthlySale`).
- Integra com `productsRepository` via IDs UUID de produtos/serviços.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/env.ts`
- **Usado por:** `src/pages/api/vendas.ts`, `src/pages/api/venda-itens.ts`, `src/pages/api/mensais.ts`

## Notas

- Datas de negócio em `date`; valores monetários em `numeric(14,2)`.
- A consolidação mensal é calculada a partir das vendas do mês e persistida em `monthly_sales`.
