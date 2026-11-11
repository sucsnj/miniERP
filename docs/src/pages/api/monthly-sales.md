# `src/pages/api/mensais.ts`

> Relatórios mensais consolidados de vendas.

## O que faz

- `GET ?mes=&ano=`: retorna a linha de `vendas_mensais` do mês; sem query, retorna todos (`ano DESC, mes DESC`).
- `POST { mes, ano }`: executa `consolidateMonthly`; responde `200 { message: 'Consolidação realizada' }`.
- `DELETE { id }`: exclui o mês (`id` obrigatório); demais métodos → `405` (`Allow: GET, POST, DELETE`).

## Relações

- **Usa:** `src/database/db.ts` (`getMonthlyTotal`, `getAllMonthly`, `consolidateMonthly`, `deleteMonthly`).
- **Usado por:** `../index.md` (consolidação) e `../resumo.md` (listagem/exclusão).

## Notas

- Consolida `vendas_diarias` do mês em `vendas_mensais` (`db/vendas.db`).
