# ADR 0022 — Unicidade de nota fiscal por empresa

- **Status:** aceita

## Contexto

`public.invoices.access_key` era `unique` global. Em ambiente multiempresa, a importação de uma nota cuja chave já existia em outra empresa falhava com `23505` e quebrava o isolamento esperado entre tenants. As consultas do repositório já filtram por `company_id`, mas a constraint do banco era global.

## Decisão

1. Substituir a constraint global por um índice único composto `(company_id, access_key)` (migration `0029-invoices-company-scoped-access-key.sql` e `schema.sql`).
2. Manter a verificação prévia por `listAllInvoices(ctx)` (escopada) para evitar duplicatas na mesma empresa.
3. Tolerar `23505` em `createInvoice` como "nota já importada", evitando erro 500 em corridas ou estados inconsistentes.
4. Demais tabelas de negócio já possuem unicidade composta por `company_id` (e `store_id` quando aplicável); `users.login/email` e `sessions.token_hash` permanecem globais por serem identificadores de autenticação/sessão.

## Consequências

- Empresas distintas podem importar a mesma NF-e sem colisão.
- Reimportação na mesma empresa continua deduplicada e graciosa.
- O isolamento multiempresa de notas deixa de depender apenas do filtro de aplicação.

## Alternativas consideradas

- Manter constraint global e ignorar o erro: rejeitado — mascara falhas e mantém risco de vazamento.
- Usar `ON CONFLICT` na inserção: considerado, mas a tolerância a `23505` é mais simples e preserva o fluxo existente.

## Referências

- `supabase/migrations/0029-invoices-company-scoped-access-key.sql`
- `supabase/schema.sql`
- `src/services/payablesImport.ts`
- `src/database/payablesRepository.ts`
- [ADR 0013](./0013-autenticacao-multiempresa-multiloja.md)
