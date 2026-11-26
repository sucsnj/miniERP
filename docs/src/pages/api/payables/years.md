# `src/pages/api/payables/years.ts`

> Retorna os anos disponíveis (com contas e/ou notas) para o tenant.

## O que faz

- `GET`: lista os anos distintos presentes em `payables.due_date` e `invoices.issue_date` da empresa, incluindo o ano atual. Usado pelos seletores de ano em "Consolidação mensal" e "Notas do mês".

## Relações

- **Usa:** `src/database/payablesRepository.ts` (`listAvailableYears`); `src/utils/serverAuth.ts`.
- **Usado por:** `src/services/payablesService.ts` (`fetchAvailableYears`); `src/components/summary/MonthlyConsolidation.tsx`; `src/components/summary/MonthNotes.tsx`.

## Notas

- Requer sessão autenticada (`requireApiAuth`); não exige admin.
