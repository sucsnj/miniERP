# ADR 0015 — Múltiplos admins de empresas por meio de bootstrap autenticado

- **Status:** aceita

## Contexto

O bootstrap original permitia apenas o primeiro administrador, pois não havia necessidade de múltiplas empresas. A regra foi implementada verificando se a tabela `users` estava vazia e bloqueando novas contas com exceção `Bootstrap already completed`.

O produto passou a atender mais de uma empresa, cada uma com seu próprio admin e regras individuais. Bloquear bootstraps posteriores impede a criação de novos tenants sem antes apagar todo o tenant existente.

## Decisão

1. Permitir criação de novos admin/tenants usando `PIN_MASTER` como segredo operacional.
2. O primeiro bootstrap continua podendo reivindicar o primeiro tenant legado (`companies` da mesma instalação) para preservar migrações/dados históricos.
3. Quando já existir ao menos um usuário, cada bootstrap passa a criar uma nova empresa (`companies`), uma loja (`stores`), um admin e os seeds de dados da empresa.
4. Nomes/login/e-mail ainda passam pela validação de `password/password/login`; nunca é possível assumir tenant existente de outra empresa.
5. `GET /api/auth/bootstrap` informa disponibilidade com base no segredo configurado (`PIN_MASTER`), não pelo tamanho de `users`.
6. Índice parcial atual de `users_one_admin_per_company_idx` continua valendo: uma empresa só tem um admin.

## Consequências

- Múltiplos admins de empresas distintas podem ser criados via `PIN_MASTER`.
- Contas não são roteadas para tenant legado depois que ele possui usuários.
- Credenciais com `PIN_MASTER` continuam sensíveis; exposição permite criar tenants indiscriminadamente.

## Alternativas consideradas

- **Criar nova tela pública de cadastro sem PIN_MASTER:** rejeitada, qualquer visitante poderia criar contas/tenants.
- **Vincular novos admins apenas ao tenant existente:** rejeitada, contrariaria a expectativa de empresas e regras individuais.
- **Reutilizar a empresa legada para todos os novos admins:** rejeitada, não isolaria regras e dados por empresa.

## Referências

- [ADR 0013](./0013-autenticacao-multiempresa-multiloja.md)
- [ADR 0014](./0014-ocr-local-e-indexeddb.md)
- `supabase/migrations/0025-multiple-company-bootstraps.sql`
- `src/pages/api/auth/bootstrap.ts`
- `src/pages/login.tsx`
