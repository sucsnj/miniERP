# `src/components/ModalCarrinho.tsx`

## Descrição

Modal, renderizado via `createPortal` no `document.body`, que exibe os itens atuais do carrinho de uma venda (produtos/serviços) com controle de quantidade, subtotal por item, total geral e ações de remoção/limpeza.

## Contexto

Usado pelo `DailySaleForm` (venda nova) e pelo `EditSaleForm` (edição de venda) para gerenciar os itens antes de salvar. O estado dos itens vem do hook `useCart`.

## Responsabilidades

- Listar itens do carrinho (nome, tipo PRODUTO/SERVICO, código interno, preço unitário).
- Controlar quantidade por item (botões `−`/`+` e input numérico com mínimo 1).
- Exibir subtotal por item e total geral.
- Remover item individual e limpar todo o carrinho.
- Fechar por ESC, clique no overlay ("fora") ou botão "Concluir".
- Manter foco dentro do modal via `useFocusTrap`.

## Assinatura

```ts
interface ModalCarrinhoProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, tipo: 'PRODUTO' | 'SERVICO', newQty: number) => void;
  onRemoveItem: (id: number, tipo: 'PRODUTO' | 'SERVICO') => void;
  onClearCart: () => void;
}

const ModalCarrinho: React.FC<ModalCarrinhoProps>;
```

`CartItem` é o tipo exportado por `DailySaleForm`:

```ts
interface CartItem {
  id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  preco_venda?: number | null;
  quantidade: number;
  codigo_interno?: string;
  referencia?: string;
}
```

## Props

- `isOpen` - controla exibição/ocultamento do modal.
- `onClose` - fecha o modal (ESC, overlay, botão "Concluir").
- `cartItems` - itens atuais do carrinho.
- `onUpdateQuantity` - atualiza a quantidade de um item.
- `onRemoveItem` - remove um item do carrinho.
- `onClearCart` - esvazia o carrinho.

## Dependências

- `createPortal` (React DOM).
- `useFocusTrap` (`src/utils/focus`).
- `formatCurrency` (`src/utils/formatter`).
- Ícones MUI (`ShoppingCartIcon`, `DeleteIcon`, `CloseIcon`, `AddIcon`, `RemoveIcon`).
- Estilo próprio via CSS `<style jsx>` (classes `cart-modal-*`).

## Observações

- Retorna `null` se `isOpen` for `false` ou se `typeof document === 'undefined'` (seguro para SSR).
- `totalItems` soma as quantidades; `totalValue` soma `preco_venda × quantidade`.
- Badge de tipo: `badge-produto` (azul) ou `badge-servico` (roxo).
- Responsivo: abaixo de 640px o layout muda para coluna.
- Z-index alto (`99999`) para ficar acima de outros modais.