# `src/components/ConfirmDialog.tsx`

## Descrição

Componente de diálogo de confirmação para ações sensíveis.

## Contexto

Utilizado em operações críticas como exclusão de registros ou confirmação de processos.

## Responsabilidades

- Renderizar modal com título, mensagem e botões de confirmação/cancelamento.
- Gerenciar foco e navegação por teclado.
- Fechar com `Escape` ou clique nos botões.

## Props

- `open`: controla visibilidade.
- `title`: título do diálogo.
- `message`: mensagem exibida.
- `confirmText`: texto do botão de confirmação (default: "Confirmar").
- `cancelText`: texto do botão de cancelamento.
- `onConfirm`: callback de confirmação.
- `onCancel`: callback de cancelamento.

## Dependências

- `useShortcuts`: captura atalhos de teclado.
- `useFocusTrap`: mantém foco dentro do modal.
- `createPortal`: renderiza no `document.body`.

## Exemplo de uso

```tsx
<ConfirmDialog
  open={isOpen}
  title="Excluir registro"
  message="Tem certeza que deseja excluir este item?"
  confirmText="Sim, excluir"
  cancelText="Cancelar"
  onConfirm={handleDelete}
  onCancel={handleClose}
/>
```

## Observações

- Usa `createPortal` para renderizar no `document.body`.
- Oferece acessibilidade básica com roles ARIA e controle de tabulação.
- O botão de cancelamento só aparece se onCancel e cancelText forem definidos.
- O fechamento padrão chama onConfirm caso onCancel não exista.
