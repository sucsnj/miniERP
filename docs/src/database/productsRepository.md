# `src/database/productsRepository.ts`

> Repositório de catálogo (produtos, serviços, cadastros auxiliares e estoque) sobre o Supabase/Postgres. Substitui `produtosDb.ts` nas rotas migradas da Fase 3.

## O que faz

- Usa o cliente server-only `getSupabaseServerClient()` (`src/database/supabase.ts`).
- Gerencia categorias, marcas, fornecedores e unidades de medida (listar, criar, atualizar, excluir), protegendo seeds via RPCs.
- Lista, cria, atualiza, exclui e alterna status de produtos (via RPCs `create_product`, `update_product`, `delete_product` e `list_products`).
- Lista, cria, atualiza e exclui serviços (via RPCs `create_service`, `update_service`, `delete_service` e `list_services`).
- Lista e aplica movimentações de estoque (`apply_stock_movement`), com validação de duplicidade de código interno e código de barras.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/env.ts`
- **Usado por:** `src/pages/api/products*.ts`

## Notas

- IDs são `uuid` (strings) e os valores monetários/quantidades usam `numeric`.
- Operações compostas são atômicas via RPC no Postgres.
