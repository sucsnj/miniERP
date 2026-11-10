# `src/components/payables/PayablesFilterPanel.tsx`

> Painel "Detalhe" de Contas a Pagar: filtros, tabela e confirmação de exclusão.

## O que faz

- Filtros por distribuidora, intervalo de vencimento e status; botão "Limpar filtros".
- Tabela do período com ações Ver, Excluir (via [ConfirmDialog](../common/ConfirmDialog.md)) e Pagar (só pendentes).
- Tooltip de observações no status via `<style jsx>` (`data-observacoes`).

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `AccountDetails`, `formatCurrency` (`src/utils/formatter.tsx`), `contas.module.css`.
- **Usado por:** `../../pages/contas-a-pagar.md` (recebe `filteredAccounts` já filtradas).

## Notas

- `handleEdit` está na interface de props mas não é usado (dead prop).
