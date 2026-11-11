# `src/pages/resumo.tsx`

> Resumo Mensal (`/resumo`): exibe as consolidações mensais (normal e especial) e permite excluí-las.

## O que faz

- Carrega as consolidações via `useMonthlyData` (`loadMensais`).
- Alterna entre tabela "comum" (ticket médio, melhor dia, maior venda, total) e "especial" (`totalEsp`, `qtdVendasEsp`).
- Exclui um mês (`handleDelete`) somente após confirmação (`useConfirmDialog` + `ConfirmDialog`).
- Formata valores com `formatCurrency` e datas com `dayjs` pt-BR.

## Relações

- **Usa:** `useToast`, `useMonthlyData`, `useConfirmDialog`; `ConfirmDialog`; utils `formatter`, `captalize`.
- **Usado por:** consome `./api/mensais.md`.

## Notas

- Exclusão de mês consolidado é irreversível.
