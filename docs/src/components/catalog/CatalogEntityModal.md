# `src/components/catalog/CatalogEntityModal.tsx`

> Modal genérico de criação/edição dos cadastros auxiliares (categoria, marca, fornecedor e unidade de medida).

## O que faz

- Renderiza título, campos de texto controlados, ações Salvar/Atualizar e Fechar.
- Quando recebe `deleteAction`, mostra o botão Excluir e abre um [ConfirmDialog](../common/ConfirmDialog.md) de perigo.
- Mantém o foco no diálogo (`useFocusTrap`) e preserva os IDs usados pelos formulários.

```ts
interface CatalogEntityModalProps {
  title: string; titleId: string; fields: CatalogEntityField[];
  submitLabel: string; submitButtonId: string; cancelButtonId: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>; onClose: () => void;
  deleteAction?: { title: string; message: React.ReactNode;
    confirmButtonId: string; cancelButtonId: string; onConfirm: () => void };
}
// CatalogEntityField: { id, label, placeholder, value, required?, autoFocus?, onChange }
```

## Relações

- **Usa:** [ConfirmDialog](../common/ConfirmDialog.md), `useFocusTrap` (`src/utils/focus.tsx`), `produtos.module.css`.
- **Usado por:** [cadastro](../../pages/cadastro.md), que fornece estado e handlers dos hooks `useCategory`, `useBrand`, `useSupplier` e `useUnitOfMeasure`.

## Notas

- Substitui oito componentes específicos (criação/edição de cada entidade) por uma única UI.
- Fechar limpa o formulário no handler da página; excluir chama `onConfirm` e fecha o modal.
