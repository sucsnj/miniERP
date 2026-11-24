# `src/utils/distributors.ts`

> Normalização, busca e aplicação de distribuidoras/regras de importação.

## O que faz

- `normalizeMatchText` — minúsculas sem acentos/pontuação (`NFD`, `[^a-z0-9]` removidos).
- `normalizeDistributorConfig` — valida lista: tipos/regras específicos, normalização de aliases, `taxIds` (um ou mais CNPJ/CPF de 11 ou 14 dígitos), limites (`100` distribuidoras, `30` aliases, `20` regras).
- Compatibilidade retroativa: `taxId` (string) é convertido para `taxIds` (array).
- `normalizeTaxId` — remove não dígitos e aceita apenas CPF (11) ou CNPJ (14).
- `findDistributor(config, emitter, emitterTaxId?)` — prioriza match exato por `taxId`; só então busca aliases que casam `emit.xNome`.
- `findDistributor(config, emitter)` — acha a distribuidora com aliases que casam `emit.xNome`; múltiplos casam a mais longa.
- `applyDistributorRules(distributor, amount)` — aplica `amount_adjustment` em ordem (soma ajusta) e `name_override` (último vence).

## Relações

- **Usa:** nulla máquina.
- **Usado por:** [payablesImport.ts](../services/payablesImport.md), [DistributorSettings.tsx](../components/payables/DistributorSettings.md), [`src/pages/api/admin/distributors.ts`](../pages/api/admin/distributors.md).

## Notas

- `amount_adjustment` somam o valor numérico; sem validação fiscal obrigatória.
- `enabled: false` exclui a distribuidora do match.
