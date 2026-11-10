# `src/pages/contas-a-pagar.tsx`

> Gestão de contas a pagar (`/contas-a-pagar`): cadastro, pagamento, filtros, importação XML, backup, agenda e resumo.

## O que faz

- Lista contas do mês (`fetchAccounts(year, month)`) e do ano (`fetchAccounts(year)`); filtros por distribuidora, status e intervalo de vencimento (persistidos em `localStorage`).
- CRUD via `registerAccount`/`updateAccount`/`deleteAccount`; valida `distribuidora`, `valor` (> 0), `vencimento` e `documento`.
- Paga (`payAccount`) e cancela pagamento (`cancelAccountPayment`); a observação é gravada via `updateAccount` antes do pagamento.
- Importa XML NF-e via `fetch('/api/contas/import')`; backup via `backupAccounts`.

## Relações

- **Usa:** `contasService`; componentes `payables/*` e `summary/Summary`; utils `validation`, `number`, `forms`, `shortcuts`, `date`.
- **Usado por:** consome `./api/contas.md`, `./api/contas/import.md` e `./api/contas/backup.md`.

## Notas

- `filteredAccounts`/`latestAccounts` (memo) derivam de `accountsYear`; Escape limpa o formulário.
- Duplicidade (distribuidora+documento) é rejeitada só na criação.
