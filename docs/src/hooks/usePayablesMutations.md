# `src/hooks/usePayablesMutations.ts`

> Mutations do módulo de contas a pagar com optimistic update/rollback via TanStack Query.

## O que faz

- `useCreateAccount`: optimistic insert nas listas de payables do tenant no mês/ano correspondente ao vencimento; rollback em erro; invalida payables ao finalizar.
- `useUpdateAccount`: optimistic update do registro nas listas do tenant; rollback em erro; invalida payables ao finalizar.
- `useDeleteAccount`: optimistic remove do registro; rollback em erro; invalida payables ao finalizar.
- `usePayAccount` / `useCancelPayment`: optimistic toggle de status para `Pago`/`Pendente`; rollback em erro; invalida payables ao finalizar.
- `useImportAccountsFromXml`: invalida payables **e** invoices do tenant; não altera cache otimisticamente (importação massiva).
- `useDeleteInvoice`: optimistic remove da invoice do mês no cache; rollback em erro; invalida invoices ao finalizar.
- `isTenantQuery`-like predicates são importados de `src/utils/queryPredicates.ts`.

## Relações

- **Usa:** `useAuth`, `useQueryClient`, `src/services/payablesService.ts`, `src/services/invoicesService.ts`, `tenantKeys`, `identityFromUser`, `queryPredicates`.
- **Usado por:** `src/pages/payables.tsx`, `src/components/summary/MonthNotes.tsx`.

## Notas

- Snapshot/rollback acompanham exclusivamente a loja/empresa do usuário; não vazam entre tenants.
- Payables usam Portuguese UI status (`Pendente`/`Pago`) e mantem compatível com filtros do frontend; não há mudança de contrato.
