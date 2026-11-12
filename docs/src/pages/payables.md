# `src/pages/payables.tsx`

> Gestão de contas a pagar (`/payables`): cadastro, pagamento, filtros, importação XML, backup, agenda e resumo.

## O que faz

- Lista contas do mês e ano via `usePayables` (`useQuery`, tenant-scoped); filtros por distribuidora, status e intervalo de vencimento (persistidos em `localStorage`).
- CRUD via `useCreateAccount`/`useUpdateAccount`/`useDeleteAccount` (optimistic update/rollback); valida `distribuidora`, `valor` (> 0), `vencimento` e `documento`.
- Paga (`usePayAccount`) e cancela pagamento (`useCancelPayment`); a observação é gravada via `useUpdateAccount` antes do pagamento.
- Importa XML NF-e via `useImportAccountsFromXml`; invalida payables e invoices do tenant.

## Relações

- **Usa:** `usePayables`, `usePayablesMutations`, `useAuth`, componentes `payables/*` e `summary/Summary`; utils `validation`, `number`, `forms`, `shortcuts`, `date`.
- **Usado por:** consome `./api/contas.md`, `./api/contas/import.md` e `./api/contas/backup.md`.

## Notas

- `filteredAccounts`/`latestAccounts` (memo) derivam de `accountsYear`; Escape limpa o formulário.
- Duplicidade (distribuidora+documento) é rejeitada só na criação.
