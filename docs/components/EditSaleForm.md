# `src/components/EditSaleForm.tsx`

## Descrição

Formulário de edição de uma venda diária existente, usado no Dashboard quando o usuário clica em "Editar" em uma venda recente. Pré-carrega os itens da venda e permite alterar data, valor e observações, além de gerenciar o carrinho de itens (produtos/serviços).

## Contexto

Renderizado pela página `src/pages/index.tsx` no lugar do formulário de nova venda quando `editingSale` está preenchido (janela de edição de 2 dias verificada antes de abrir).

## Responsabilidades

- Carregar os itens existentes da venda via `buscarVendaItens(sale.id)` ao montar.
- Exibir campos editáveis de data, valor (com cálculo automático a partir dos itens) e observações.
- Compartilhar o estado do carrinho com o fluxo de nova venda através do `useCart`.
- Recalcular o valor do campo quando os itens do carrinho mudam (padrão React de ajustar estado durante a renderização).
- Salvar alterações chamando `atualizarVenda()` e notificar via `onToast`.
- Integrar os modais `ModalSelecionarItens` (adicionar itens) e `ModalCarrinho` (gerenciar itens).

## Assinatura

```ts
interface EditSaleFormProps {
  sale: VendaDiaria;
  onSaved: () => void;
  onCancel: () => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const EditSaleForm: React.FC<EditSaleFormProps>;
```

Itens carregados são convertidos de `VendaItemData` para `CartItem`:

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

Ao salvar, o carrinho é enviado como:

```ts
{
  item_id: number;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  quantidade: number;
  preco_unitario: number;
  codigo_interno: string | null;
  referencia: string | null;
}
```

## Props

- `sale` - venda em edição (`VendaDiaria`).
- `onSaved` - callback executado após salvar com sucesso (fecha o modo de edição).
- `onCancel` - callback para cancelar a edição.
- `onToast` - callback de notificação (sucesso/erro).

## Dependências

- `vendasService` (`buscarVendaItens`, `atualizarVenda`).
- `ModalCarrinho`, `ModalSelecionarItens`.
- `useCart` (estado e ações do carrinho compartilhadas com `DailySaleForm`).
- `parseNumber` (`src/utils/number`).
- Ícones MUI (`ShoppingCartIcon`, `AddShoppingCartIcon`).

## Observações

- Foca e seleciona o campo de valor ao abrir.
- O valor é recalculado automaticamente a partir dos itens quando o carrinho não está vazio; o campo manual é preservado quando o carrinho é limpo.
- A janela de edição (2 dias) é validada na página e rejeitada com 403 na API (`PUT/DELETE /api/vendas`).
- Exibe `loadingItens` enquanto os itens são buscados.