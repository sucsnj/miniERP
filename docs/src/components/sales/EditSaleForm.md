# `src/components/sales/EditSaleForm.tsx`

> Formulário de edição de uma venda existente, com gerenciamento de itens.

## O que faz

- Carrega os itens via `fetchSaleItems` → `CartItem`; permite editar data, valor e observações.
- Recalcula o valor a partir do carrinho quando ele não está vazio (preserva o campo se for esvaziado).
- Salva via `updateSale`; integra [SelectItemsModal](../cart/SelectItemsModal.md) e [CartModal](../cart/CartModal.md).

```ts
interface EditSaleFormProps {
  sale: DailySale; onSaved: () => void; onCancel: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
```

## Relações

- **Usa:** `fetchSaleItems`/`updateSale` (`src/services/vendasService.ts`), `useCart` (`src/hooks/useCart.ts`), `parseNumber`, modais de carrinho, `sales.module.css`.
- **Usado por:** `../../pages/index.md` quando `editingSale` está preenchido.

## Notas

- Janela de edição de 2 dias validada na página e na API (403).
- Foca/seleciona o campo de valor ao abrir; mostra `loadingItems` durante a busca.
- Os controles do carrinho usam classes próprias de `sales.module.css`; não dependem mais do `styled-jsx` de `DailySaleForm`.
