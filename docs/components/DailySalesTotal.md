# `src/components/DailySalesTotal.tsx`

## Descrição

Painel de resumo de vendas. Exibe total do período, total do dia selecionado, ticket médio e ações recentes.

## Contexto

Utilizado no Dashboard de Vendas para exibir resumo de vendas.

## Responsabilidades

- Calcular total acumulado do período.
- Calcular total e média do dia selecionado.
- Exibir as últimas 4 vendas recentes.
- Permitir exclusão e edição se a venda estiver dentro do período editável.

## Props

- `sales` - vendas carregadas.
- `selectedDay` - data de referência.
- `recentSales` - vendas recentes para exibição rápida.
- `onEditSale` / `onDeleteSale` - callbacks de ação.
- `children` - componente adicional, como `DailySaleForm`.

## Dependências

- `formatter` (formatação de moeda).
- `date` (formatação e timestamp).
- `canEdit` (verifica permissão de edição).
- `useShortcuts` (captura de atalhos de teclado).

## Exemplo de uso

```tsx
<DailySalesTotal
  sales={sales}
  selectedDay={selectedDay}
  recentSales={recentSales}
  onEditSale={onEditSale}
  onDeleteSale={onDeleteSale}
/>
```

## Observações

- Adiciona listener de tecla `Delete` para excluir a venda mais recente.
- Usa `canEdit()` para bloquear ações quando a venda tem mais de 2 dias.
