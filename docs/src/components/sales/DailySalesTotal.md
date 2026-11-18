# `src/components/sales/DailySalesTotal.tsx`

> Painel de resumo de vendas: período, dia, ticket médio e últimas vendas.

## O que faz

- Total/quantidade/ticket médio do período e (se `selectedDay`) total, vendas e média do dia.
- Lista "Últimas 4 vendas" (`recentSales`) com Editar/Excluir quando `canEdit(data)`; senão mostra "Bloqueado". O botão Excluir não exibe ícone.
- Atalho `Delete` exclui a venda mais recente; renderiza `children` no card do formulário.
- Blocos de vendas recém-adicionadas (inserções otimistas com ID `optimistic-*`) recebem destaque visual e voltam suavemente ao estado normal em até 5s (`historyItemNew`).
- Ao excluir, o bloco fica imediatamente em preto e branco e desaparece em até 2s (`historyItemDeleting`), sem sofrer efeito de hover; a chamada `onDeleteSale` é executada apenas após a animação.

```ts
interface DailySalesTotalProps {
  sales: DailySale[]; selectedDay?: string; recentSales?: DailySale[];
  onEditSale?: (sale: DailySale) => void; onDeleteSale?: (id: string) => void;
  children?: ReactNode;
}
```

## Relações

- **Usa:** `DailySale` (`src/services/salesService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString` (`src/utils/date.ts`), `canEdit` (`src/utils/edit.ts`), `useShortcuts`.
- **Usado por:** `../../pages/index.md`.

## Notas

- Largura livre de `105%`, `transform: scale` e larguras mínimas fixas removidos: o card usa `width: 100%`, `min-width: 0` e grids com `minmax(0)` para não estourar viewports longos não móveis.
- `canEdit` bloqueia vendas fora da janela editável; o `Delete` age sobre a maior `id` de `recentSales`.
