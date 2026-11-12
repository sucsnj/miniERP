# `src/pages/resumo.tsx`

> Resumo Mensal (`/summary`): exibe as consolidações mensais (normal e especial) e permite excluí-las.

## O que faz

- Carrega as consolidações da loja atual via `useMonthlyData` (`useQuery`).
- Seleciona mês/ano e consolida por loja via `handleConsolidate`, com mutation e toast; somente admin executa/exclui.
- Alterna entre tabela "comum" (ticket médio, melhor dia, maior venda, total) e "especial" (`totalEsp`, `qtdVendasEsp`).
- Exclui um mês via mutation otimizada (`handleDelete`) após confirmação (`useConfirmDialog` + `ConfirmDialog`).
- Formata valores com `formatCurrency` e datas com `dayjs` pt-BR.

## Relações

- **Usa:** `useToast`, `useMonthlyData`, `useConfirmDialog`, `useAuth`; `ConfirmDialog`; `useMutation`; utils `formatter`, `captalize`, `date`.
- **Usado por:** consome `./api/mensais.md`.

## Notas

- Exclusão de mês consolidado é irreversível.
- A lista é servida por cache tenant-scoped com optimistic update/rollback em falhas.
