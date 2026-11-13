# `src/pages/api/monthly-sales.ts`

> Relatórios mensais consolidados de vendas.

## O que faz

- `GET`: retorna todos os consolidados por ano DESC/mês DESC; com `month=&year=`, retorna a linha do mês; com `action=missing`, retorna os meses anteriores que têm vendas mas ainda não têm `monthly_sales`.
- `POST { month, year }`: executa `consolidateMonthly`; responde `200 { message: 'Consolidação realizada' }`.
- `DELETE { id }`: exclui o mês (`id` obrigatório); demais métodos → `405` (`Allow: GET, POST, DELETE`).

## Relações

- **Usa:** `src/database/salesRepository.ts` (`getMonthlyTotal`, `listMonthlySales`, `consolidateMonthly`, `deleteMonthlySale`, `listMissingMonthlyConsolidationMonths`), `requireApiAuth`, `isAdmin`.
- **Usado por:** `../index.md` (consolidação) e `../resumo.md` (listagem/exclusão).

## Notas

- `action=missing` normaliza e retorna `{ month, year }` filtrados por tenant/loja.
- Consolidação do mês é até a loja atual, sem vazamento entre tenants.
