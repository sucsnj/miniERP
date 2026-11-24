# `src/pages/api/payables/import.ts`

> Importa contas a pagar a partir do XML de NF-e (`nfeProc`) e registra a nota.

## O que faz

- `POST { xml, distributorId?, newDistributorName?, newDistributorAliases? }`: faz parse e executa o pipeline em `src/services/payablesImport.ts`.
- Ordem distribuidora: `override.newDistributorName` (cria na hora, capturando `emit.CNPJ`/`emit.CPF`) ou `override.distributorId` (usa cadastrada) ou `findDistributor()` (prioriza `emit.CNPJ`/`emit.CPF` exato e, se não houver, casa `emit.xNome` ao `aliases`).
- Aplica regras (`amount_adjustment`, soma cumulativa; `name_override`, rename sequencial) antes de insert.
- Se não houver correspondência alguma: responde `409` com `{ code: 'DISTRIBUTOR_NOT_FOUND', xmlDistributorName, availableDistributors }`.
- Importa duplicatas inexistentes (`supplierName + document`), registra a nota (`accessKey` deduplicada) e retorna `200 { sucesso, registros }`.

## Relações

- **Usa:** `src/services/payablesImport.ts`; `payablesRepository`; `settingsRepository`; `xml2js`; `serverAuth`.
- **Usado por:** [`src/pages/payables.tsx`](../../payables.md).

## Notas

- Nenhum fallback hard-coded para nomes/regras; todo o vocabulário deriva de `company_settings.distributor_config` (admin-only).
- XML é enviado uma vez; no caso de distribuidora ausente, o XML é reaproveitado no mesmo fluxo após escolha/criação (sem upload extra).
- Criação de distribuidora não aciona deploy; administrador pode cadastrar na importação ou no `/settings`.
