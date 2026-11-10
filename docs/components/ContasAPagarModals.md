# `src/components/ContasAPagarModals.tsx`

## Descrição

Agrupa os modais do módulo Contas a Pagar: **detalhes da conta** (com edição inline) e **observações do pagamento**.

## Contexto

Renderizado em `contas-a-pagar.tsx`. Estados controlados pelo pai (`selectedConta`, `editingConta`, `payModalOpen`).

## Props

```ts
interface ContasAPagarModalsProps {
  selectedConta: ContaDetalhe | null;    // abre o modal de detalhes
  editingConta: ContaDetalhe | null;     // modo edição dentro do modal
  distribuidora; setDistribuidora;        // campos editáveis (inline)
  valor; setValor;
  vencimento; setVencimento;
  documento; setDocumento;
  bancoObservacoes; setBancoObservacoes;
  payModalOpen: boolean;                  // abre o modal de observações do pagamento
  payObservacao: string; setPayObservacao;
  onCloseSelectedConta: () => void;
  onEditar: (conta: ContaDetalhe) => void;
  onCancelEdit: () => void;
  onStartPayment: (conta: ContaDetalhe) => void;
  onConfirmPayment: () => void;
  onClosePayModal: () => void;
  onCancelPayment: (id: number) => void;
  onSave: (event: React.FormEvent<HTMLButtonElement>) => void;
}
```

## Comportamento/Responsabilidades

- **Modal de detalhes:** mostra Distribuidora, Valor, Vencimento, Documento, Status e Banco/Observações. Quando `editingConta?.id === selectedConta.id`, os campos viram inputs/textareas editáveis com botões "Salvar" (`onSave`) e "Cancelar" (`onCancelEdit`); senão, exibe botão "Editar" (`onEditar`).
- Ações inferiores: `status === 'Pendente'` → "Pagar conta" (`onStartPayment`); senão → "Cancelar pagamento" (`onCancelPayment` + `onCancelEdit`). Botão "Fechar" (`onCloseSelectedConta` + `onCancelEdit`).
- **Modal de pagamento:** textarea de observações (`autoFocus`) + "Confirmar pagamento" (`onConfirmPayment`) / "Cancelar".
- `useFocusTrap(modalRef, Boolean(selectedConta || payModalOpen))` — ambos modais compartilham a ref.
- `useShortcuts(['Escape'], ...)`: fecha edição primeiro, depois o modal principal.
- Overlay fecha ao clicar fora (`onClick` no overlay + `stopPropagation` no conteúdo).

## Dependências

- `src/utils/shortcuts` (`useShortcuts`), `src/utils/focus` (`useFocusTrap`).
- `src/utils/formatter` (`formatCurrency`), `src/services/contasService` (`ContaDetalhe`), `src/styles/contas.module.css`.

## Observações

- **Quirk:** o botão "Salvar" chama `onSave(event)` passando um `MouseEvent` de `onClick` (não um `FormEvent`). A assinatura foi tipada de acordo (`React.FormEvent<HTMLButtonElement>`). Funciona porque `handleSubmit` da página só usa `preventDefault()` e lê valores do **estado**, não do `event.target`.
- Não há modal de criação separado — a criação usa o formulário principal; os modais cobrem detalhe/edição e pagamento.