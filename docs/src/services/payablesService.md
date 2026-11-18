# `src/services/payablesService.ts`

> Cliente HTTP via `fetch` para o domínio de contas a pagar (endpoints internos `/api/contas*`).

## O que faz

- Expõe `AccountDetails` com campos de conta a pagar (vencimento `YYYY-MM-DD`, status `Pendente`/`Pago`).
- Envia e recebe payloads tipados; `parseResponse<T>` lanca `Error` em `!response.ok` para as mutations usarem rollback.
- importações: `importAccountsFromXml` (legacy, 1ª via); `importPayablesXml` sem lançar erro em 409 — devolve `{ sucesso: false, code: 'DISTRIBUTOR_NOT_FOUND', xmlDistributorName, availableDistributors }` para UI completar.
- `fetchAccounts` mapeia a resposta para `AccountDetails` e lanca erro em falha.

## Relações

- **Usa:** [`/api/contas`](../pages/api/payables.md), [`/api/contas/import`](../pages/api/payables/import.md), [`payablesImport`](./payablesImport.md)
- **Usado por:** componentes/páginas de Contas a Pagar ([`docs/src/pages/payables.md`](../pages/payables.md))

## Notas

- `fetchAccounts(year, month?)` monta `URLSearchParams` e omite `month` quando não informado.
- Ações `pagar`/`cancelar` são enviadas via `POST /api/contas` com `{action, id}` (sem rota REST dedicada).
- Duplicidade `distribuidora+documento` é tratada pela API e retornada no JSON.