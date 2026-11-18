# ADR 0019 — Distribuidoras e regras da importação XML configuradas por empresa

- **Status:** aceita

## Contexto

A importação XML tinha os nomes das distribuidoras, aliases e regras hard-coded (`validNames`/`formatDistributor`/`adjustAmountByDistributor`), dificultando manutenção e usando conhecimento de domínio que não deveria viver em código. Além disso, alterações entre ambientes/empresas eram impossíveis sem deploy.

## Decisão

1. Persistir a configuração de distribuidoras em `company_settings.distributor_config` (JSON array, tenant da empresa).
2. Cada item possui:
   - `id`, `name`;
   - `aliases` usados para casar `emit.xNome` do XML (normalizados, sem acentos);
   - `enabled`;
   - `rules[]`.
3. Regras são discriminadas por `type`:
  - `amount_adjustment`: soma/subtrai `value` e pode haver múltiplas regras aplicadas em ordem;
  - `name_override`: renomeia o nome final após correspondência/regras (múltiplas aplicadas em ordem; último vence).
4. Admin-only (`/api/admin/distributors`) pode cadastrar/editar/excluir regra, rule e aliases; merchants só consomem através da importação batch empresa.
5. XML sem distribuidora correspondente não é importada: retorna `409 DISTRIBUTOR_NOT_FOUND` com `xmlDistributorName`, `availableDistributors` e o usuário escolhe uma distribuidora existente ou cria uma nova no modal/hook de importação existente.
6. Itens novos criados em `POST /api/payables/import` com `newDistributorName`/`newDistributorAliases`; o processo cria a distribuidora e continua a importação na mesma request.
7. RLS/grant: funções impactadas ficam em company_settings; acesso via service role.
8. Configuração hexadecimal XML e regras rodam diretamente em `src/services/payablesImport.ts`, substituindo normalização/ajuste inline.
9. Fluxo completo atualiza (após investir na tabela) payables/invoices como antes.
10. Seed é intencionalmente vazio; cadastro é feito via administração.

## Consequências

- Importação não depende mais de nomes válidos hard-coded em código.
- Pode exibir múltiplas regras de valor/nome por distribuidora (ex.: frete, retenção).
- XML contém `emit.xNome`; qualquer fornecedor desconhecido pode ser cadastrado sem deploy.
- Alteração de regras entra em vigor imediatamente na próxima importação.
- Configuração JSON fica ordenada pela UI e é propagada para toda a empresa/tenant.

## Alternativas consideradas

- Manter lista hard-coded em memória: rejeitada — impede customização de tenant ou mudança sem deploy.
- Criação automática de distribuidora com nome do XML: rejeitada como default; pode criar centenas de variações do mesmo emitente.
- JSONB livre sem tipo discriminador: rejeitada — sem validação/tipagem, UI e importador não sabem interpretar os valores.

## Referências

- `supabase/migrations/0030-add-company-settings-distributors.sql`
- `src/utils/distributors.ts`, `src/services/payablesImport.ts`
- `src/services/adminService.ts`
- `src/pages/api/admin/distributors.ts`, `src/pages/api/payables/import.ts`
- `src/pages/settings.tsx`, `src/components/payables/DistributorSettings.tsx`, `src/components/payables/MissingDistributorModal.tsx`
