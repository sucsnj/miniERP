# `src/database/payablesRepository.ts`

> Repositório de contas a pagar (`payables`), notas fiscais (`invoices`) e histórico de busca da tabela de medicamentos (`medicine_search_history`) sobre o Supabase/Postgres.

## O que faz

- Usa o cliente Supabase server-side (`getSupabaseServerClient()`).
- Lista, cria, atualiza, exclui e paga/cancela contas a pagar (`payables`), com filtro por período.
- Lista, cria e exclui notas fiscais (`invoices`), busca por valor, soma por ano e filtro por período.
- Gerencia histórico de busca de medicamentos: buscar, salvar (upsert + poda para 25), listar recentes e limpar.

## Relações

- **Usa:** `src/database/supabase.ts`, `src/utils/env.ts`
- **Usado por:** `src/pages/api/contas.ts`, `src/pages/api/contas/import.ts`, `src/pages/api/notas.ts`, `src/pages/api/tabela.ts`

## Notas

- IDs são `uuid` (strings); valores monetários usam `numeric(14,2)`.
- Status de conta: `PENDING`/`PAID`, mapeado para `Pendente`/`Pago` nas rotas.
