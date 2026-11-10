# `src/components/sales/DailySalesTotal.tsx`

> Painel de resumo de vendas: período, dia, ticket médio e últimas vendas.

## O que faz

- Total/quantidade/ticket médio do período e (se `selectedDay`) total, vendas e média do dia.
- Lista "Últimas 4 vendas" (`recentSales`) com Editar/Excluir quando `canEdit(data)`; senão mostra "Bloqueado".
- Atalho `Delete` exclui a venda mais recente; renderiza `children` no card do formulário.

```ts
interface DailySalesTotalProps {
  sales: DailySale[]; selectedDay?: string; recentSales?: DailySale[];
  onEditSale?: (sale: DailySale) => void; onDeleteSale?: (id: number) => void;
  children?: ReactNode;
}
```

## Relações

- **Usa:** `DailySale` (`src/services/vendasService.ts`), `formatCurrency` (`src/utils/formatter.tsx`), `formatDateString` (`src/utils/date.ts`), `canEdit` (`src/utils/edit.ts`), `useShortcuts`.
- **Usado por:** `../../pages/index.md`.

## Notas

- `canEdit` bloqueia vendas fora da janela editável; o `Delete` age sobre a maior `id` de `recentSales`.
