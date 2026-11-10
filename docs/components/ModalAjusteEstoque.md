# `src/components/ModalAjusteEstoque.tsx`

## Descrição

Componente responsável por gerenciar o modal de ajuste de estoque.

## Contexto

Usado para realizar ajustes no estoque de produtos/serviços.

## Responsabilidades

- Gerenciar o modal de ajuste de estoque.
- Receber dados do componente pai.
- Exibir o histórico de movimentações.
- Salvar o ajuste de estoque.
- Cancelar o ajuste de estoque.
- Focar no campo de quantidade.

## Props

- `open`: Se o modal está aberto ou fechado.
- `itemName`: Nome do produto.
- `itemEstoque`: Estoque atual do produto.
- `quantidade`: Quantidade a ser ajustada.
- `setQuantidade`: Função para atualizar a quantidade.
- `descricao`: Descrição do ajuste.
- `setDescricao`: Função para atualizar a descrição.
- `movimentacoes`: Histórico de movimentações.
- `movimentacoesLoading`: Se as movimentações estão carregando.
- `onSave`: Função para salvar o ajuste.
- `onClose`: Função para fechar o modal.

## Dependências

- `services/produtosService.ts`: Para obter o histórico de movimentações.
- `utils/focus.ts`: Para focar no campo de quantidade.

## Exemplo de uso

```tsx
<ModalAjusteEstoque
  open={modalOpen}
  itemName={selectedProduct?.nome || ''}
  itemEstoque={selectedProduct?.estoque || 0}
  quantidade={quantidade}
  setQuantidade={setQuantidade}
  descricao={descricao}
  setDescricao={setDescricao}
  movimentacoes={movimentacoes}
  movimentacoesLoading={movimentacoesLoading}
  onSave={handleSaveAjuste}
  onClose={() => setModalOpen(false)}
/>
```

## Observações

- Ao abrir o modal, o foco é colocado no campo de quantidade (`autoFocus`).
- É um componente controlado: o fechamento é responsabilidade do pai (`onClose` nos dois botões); "Registrar Ajuste" chama `onSave` (o pai grava via PUT e fecha por conta própria).
- A seção "Últimas 10 movimentações" é apenas informativa (dados `movimentacoes`); a inclusão da movimentação AJUSTE acontece no salvamento do produto, não neste modal.