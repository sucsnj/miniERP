# `src/components/payables/PayablesFilterPanel.tsx`

> Painel "Detalhe" de Contas a Pagar: filtros, tabela e confirmação de exclusão.

## O que faz

- Filtros por distribuidora, intervalo de vencimento e status; botão "Limpar filtros" no cabeçalho, ao lado do chip "Filtro".
- Tabela do período com a linha clicável/accessível por teclado (abre detalhes) e ações Excluir (via [ConfirmDialog](../common/ConfirmDialog.md)) e Pagar (só pendentes).
- O botão "Ver" foi removido; a célula de ações não propaga o clique/tecla para a linha.
- Tooltip de observações no status via `.status:hover::after` e `data-observacoes` (fallback: `Pago`/`Pendente`).

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `AccountDetails`, `formatCurrency` (`src/utils/formatter.tsx`), `payables.module.css`.
- **Usado por:** `../../pages/payables.md` (recebe `filteredAccounts` já filtradas).

## Notas

- `handleEdit` foi removido da interface de props.
