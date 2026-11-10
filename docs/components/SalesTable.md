# `src/components/SalesTable.tsx`

## Descrição

Tabela de vendas que exibe registros históricos e operações de edição/exclusão.

## Contexto

É usado em Vendas Diárias com a finalidade de exibir uma tabela de vendas diárias, permitindo uma visão panorâmica da evolução das vendas.

## Responsabilidades

- Exibir registros de vendas ordenados por data e ID.
- Controlar o número máximo de vendas exibidas via `localStorage` (`maxSales`, default 5).
- Abrir diálogo de confirmação antes de exclusão.

## Assinatura

```ts
interface SalesTableProps {
  sales: VendaDiaria[];
  onEditSale?: (sale: VendaDiaria) => void;
  onDeleteSale?: (id: number) => void;
}

const SalesTable: React.FC<SalesTableProps>;
```

## Props

- `sales` - lista de vendas.
- `onEditSale` - callback de edição.
- `onDeleteSale` - callback de exclusão.

## Dependências

- `ConfirmDialog`
- `EditIcon`
- `DeleteIcon`
- `Tooltip`
- `VendaDiaria`
- `formatCurrency`
- `formatDateString`
- `toTimestamp`

## Observações

- Usa `ConfirmDialog` para segurança da exclusão.
- O número máximo de registros é persistido em `localStorage`.
- Editável apenas dentro da janela de 2 dias (`canEdit` de `src/utils/edit`).
- **Uso ativo**: na página `/historico` (`src/pages/historico.tsx`). Nos Dashboard (`src/pages/index.tsx`) o uso está **comentado** — no Dashboard os totais vêm de `DailySalesTotal` e o histórico do `DailySaleForm`.
