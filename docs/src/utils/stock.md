# `src/utils/stock.ts`

> Utilitários puros para cálculo de ajustes de estoque em vendas.

## O que faz

- Define tipos `SaleStockItem`, `StockAdjustment` e `StockMovementType`.
- `getSaleStockAdjustments(oldItems, newItems)`: calcula os ajustes (`ENTRADA`/`SAIDA`) necessários ao substituir itens de uma venda, considerando apenas produtos (`PRODUTO`) com `item_id`.

## Relações

- **Usa:** nenhum.
- **Usado por:** reconciliação de estoque em edição de venda (Fase 3).

## Notas

- Função pura; não acessa banco.
- Serviços (`SERVICO`) são ignorados por não afetarem estoque.
