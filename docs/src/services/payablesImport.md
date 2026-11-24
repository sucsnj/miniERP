# `src/services/payablesImport.ts`

> Pipeline da importação de XML de NF-e com normalização de distribuidoras via regras do tenant.

## O que faz

- `processPayablesXml(xml, ctx, timezone, override?)` — executa parse do XML e aplica uma ordem distribuidor:
  1. `override.newDistributorName` cria distribuidora (`rules: []`, com `taxIds` capturados do XML e/ou informados no modal) e anexa à configuração;
  2. `override.distributorId` usa distribuidora cadastrada;
  3. caso contrário, `findDistributor()` prioriza `emit.CNPJ`/`emit.CPF` exato e, se não houver, casa `emit.xNome` com `aliases` normalizados;
  4. `applyDistributorRules()` soma (`amount_adjustment`, pode haver múltiplas) e aplica `name_override` (último vence) antes de salvar registros;
  5. insere no payables (fluxo atual) e cria a nota (accessKey).
- Retorna `{ sucesso, registros }` ou `{ code: 'DISTRIBUTOR_NOT_FOUND', xmlDistributorName, availableDistributors }` para UI completar.

## Relações

- **Usa:** `payablesRepository`, `settingsRepository`, `parseXml` (`xml2js`), `src/utils/distributors.ts` (regras).
- **Usado por:** [`src/pages/api/payables/import.ts`](../pages/api/payables/import.md).

## Notas

- Aliases são comparados com acentos/maiúsculos/pontuação removidos.
- Ao usar uma distribuidora cadastrada (ou coincidir por nome/CNPJ), o CNPJ do XML e os identificadores são mesclados de forma persistente à distribuidora.
- Documento duplicado (`supplierName + document`) é ignorado no mesmo pedido; nota por `accessKey` permanece deduplicada por empresa (`invoices_company_id_access_key_uq`).
- `createInvoice` tolera violação de unicidade (`23505`) tratando a nota como já importada, evitando erro 500.
- Criação automática de distribuidoras: intencionalmente não acontece; resposta de erro `409` com contexto para o usuário.
