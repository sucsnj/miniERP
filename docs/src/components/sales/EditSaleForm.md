# `src/components/sales/EditSaleForm.tsx`

> Formulário de edição de uma venda existente, com gerenciamento de itens.

## O que faz

- Carrega os itens via `fetchSaleItems` → `CartItem`; permite editar data, valor, tipo de venda (`saleType`: Dinheiro, crédito, débito, PIX, outros) e observações.
- Recalcula o valor a partir do carrinho quando ele não está vazio (preserva o campo se for esvaziado).
- Layout em grade (`sales.module.css` `.editFormGrid`): Data, Valor (com controles do carrinho) e Tipo de venda lado a lado; Observações abaixo; botões Salvar/Cancelar em linha (`.editFormActions`) sem ocupar toda a largura. Os seletores de Data e Tipo usam largura do próprio conteúdo (`.editDateInput`/`.editSaleTypeSelect`).
- O painel usa `.editSalePanel` (largura máxima de 1440px, centralizado), igual ao card "Resumo do Período". O rótulo e o seletor de tipo usam `.editTypeLabel`/`.editSaleTypeSelect`, replicando o estilo do formulário "Registrar Venda Diária" (coluna com `gap` 8px; select `max-width: 180px`, `border-radius: 8px`, `padding: 6px 10px`, `font-size: 0.85rem`).
- Salva via `useUpdateSale` (optimistic update do cache de vendas, incluindo `saleType`); integra [SelectItemsModal](../cart/SelectItemsModal.md) e [CartModal](../cart/CartModal.md).

```ts
interface EditSaleFormProps {
  sale: DailySale; onSaved: () => void; onCancel: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
```

## Relações

- **Usa:** `fetchSaleItems` (`src/services/salesService.ts`), `useUpdateSale` (`src/hooks/useSalesMutations.ts`), `useCart` (`src/hooks/useCart.ts`), `parseNumber`, modais de carrinho, `sales.module.css`.
- **Usado por:** `../../pages/index.md` quando `editingSale` está preenchido.

## Notas

- Janela de edição de 2 dias validada na página e na API (403).
- Foca/seleciona o campo de valor ao abrir; mostra `loadingItems` durante a busca.
- Os controles do carrinho usam classes próprias de `sales.module.css`; não dependem mais do `styled-jsx` de `DailySaleForm`.
- Enquanto está em edição, o autofoco automático do formulário de registro fica suspenso; ao salvar ou cancelar, o foco volta ao campo de registro de vendas (ver `useDailySaleForm`).
