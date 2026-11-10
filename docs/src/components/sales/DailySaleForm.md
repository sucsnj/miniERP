# `src/components/sales/DailySaleForm.tsx`

> Formulário de venda diária do dashboard; apresentacional (a lógica vive no hook).

## O que faz

- Campos data, valor (calculadora `+ − × ÷`), observações e botões Registrar/Limpar; botão do carrinho com badge.
- Valor exibido com PIX clicável; renderiza os modais de seleção, carrinho e PIX.
- Toda a lógica de estado/validação/ações está em `useDailySaleForm`.

```ts
interface DailySaleFormProps {
  sales?: DailySale[]; selectedDate: string;
  onDateChange: (date: string) => void; onSaleAdded?: () => void;
  onEditSale?: (sale: DailySale) => void; onDeleteSale?: (id: number) => void;
  showHistory?: boolean; // sales/onEditSale/onDeleteSale/showHistory hoje não são usados
}
```

## Relações

- **Usa:** `useDailySaleForm` (`src/hooks/useDailySaleForm.ts`), [SelectItemsModal](../cart/SelectItemsModal.md), [CartModal](../cart/CartModal.md), [PixModal](../pix/PixModal.md), `formatCurrency`.
- **Usado por:** `../../pages/index.md`.

## Notas

- `CartItem` foi movido para `src/types/sale.ts` (compartilhado com `useCart`/modais).
- `<style jsx>` permanece no componente (migração para CSS Modules prevista na Fase 2 do ADR 0007); `EditSaleForm` não depende mais dessas classes.
