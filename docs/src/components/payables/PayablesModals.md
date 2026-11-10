# `src/components/payables/PayablesModals.tsx`

> Modais de Contas a Pagar: detalhes/edição inline e observações do pagamento.

## O que faz

- **Detalhes**: mostra os campos; quando `editingAccount.id === selectedAccount.id` vira edição inline com Salvar/Cancelar.
- Ações inferiores: "Pagar conta" (pendente) ou "Cancelar pagamento"; botão Fechar.
- **Pagamento**: textarea de observações (`autoFocus`) + Confirmar/Cancelar.

## Relações

- **Usa:** `useShortcuts` (`src/utils/shortcuts.tsx`), `useFocusTrap` (`src/utils/focus.tsx`), `formatCurrency` (`src/utils/formatter.tsx`), `AccountDetails`, `contas.module.css`.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- ESC fecha a edição primeiro, depois o modal principal; ambos compartilham `modalRef`.
- `onSave` é tipado como `FormEvent<HTMLButtonElement>` mas recebe um `MouseEvent` do `onClick`.
