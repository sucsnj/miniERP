# `src/pages/historico.tsx`

> Histórico de Vendas (`/historico`): lista as vendas do período com filter e permite editar/excluir.

## O que faz

- Seleciona a data (`type="date"`) e carrega as vendas por mês/ano derivado via `useSales(..., { filter, autoConsolidate: false })`.
- Filtro dinâmico por valor (`todas` | `positivas` | `negativas`), persistido via `useFilter`.
- Exibe `SalesChart` e `SalesTable` com edição (`EditSaleForm`) e exclusão.
- Exporta/importa vendas via `ExportButtons`. A importação aceita vendas de qualquer mês/ano, independente do período selecionado na tela; a exportação permanece com escopo da seleção atual.

## Relações

- **Usa:** `SalesTable`, `SalesChart`, `ExportButtons`, `EditSaleForm`; hooks `useToast`, `useSales`, `useFilter`; utils `date`, `captalize`.
- **Usado por:** consome `./api/vendas.md` e `./api/venda-itens.md`.

## Notas

- Compartilha lógica com `./index.md`, mas com `autoConsolidate` desligado.
