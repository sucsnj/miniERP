# `src/utils/validation.ts`

> Validações centralizadas de campos no contrato `{ ok, message }`.

## O que faz

- `validateRequired(value, label?)`, `validateEmail`, `validateCurrency`, `validateNumber`, `validateDate`.
- Todas retornam `ValidationResult` (`{ ok, message }`) com mensagens pt-BR; `validation` é o objeto default.

## Relações

- **Usa:** `parseCurrency`/`parseNumber` (`./number.md`) e `toDate` (`./date.md`).
- **Usado por:** hooks de CRUD (`useDailySaleForm`, `useBrand`, `useCategory`, `useSupplier`, `useUnitOfMeasure`) e páginas `cadastro`/`contas-a-pagar`.

## Notas

- Só valida; parsing e regras de negócio ficam em `number.ts`/`date.ts`/`edit.ts` (ADR 0002).
