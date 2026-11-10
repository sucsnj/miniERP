# `src/utils/edit.ts`

> Regra de negócio da janela de edição de vendas (limite de 2 dias).

## O que faz

- `canEdit(data)` retorna `true` se a data está entre hoje e 2 dias atrás (inclusive).
- Compara dias no início do dia, no timezone de Recife.

## Relações

- **Usa:** `parseDate` e `now` de `./date.md`.
- **Usado por:** `useSales` e `pages/api/vendas`.

## Notas

- Regra de negócio fora do módulo de validação (ADR 0002).
