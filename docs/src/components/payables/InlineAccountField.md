# `src/components/payables/InlineAccountField.tsx`

> Campo inline individual de conta a pagar, com edição controlada, salvar/cancelar e atalhos.

## O que faz

- Exibe o valor em modo leitura e, ao clicar, torna-se editável.
- Edita apenas um campo por vez; a seleção do campo é controlada por `activeFieldId` no pai.
- Em edição, mostra ícone verde de confirmação e ícone branco de cancelamento ao lado do controle.
- Atalhos: `Enter` confirma e `Esc` cancela (sem fechar o modal, com `stopPropagation`).
- Na confirmação chama `onSave(draft)` e só sai do modo edição quando a Promise retorna `true`.
- Suporta `text`, `number`, `date` e `textarea`; o controle recebe foco ao entrar em edição.

```ts
interface InlineAccountFieldProps {
  fieldId: string;
  label: string;
  value: string;
  displayValue?: string;
  inputType?: 'text' | 'number' | 'date' | 'textarea';
  required?: boolean;
  canWrite?: boolean;
  rows?: number;
  activeFieldId: string | null;
  onActiveFieldChange: (fieldId: string | null) => void;
  onSave: (value: string) => Promise<boolean>;
}
```

## Relações

- **Usa:** `payables.module.css`, `Button`, ícones MUI.
- **Usado por:** [PayablesModals](./PayablesModals.md).

## Notas

- `draft` local por campo; ativar outro campo muda `activeFieldId` no pai e cancela a edição anterior.
- Estado `draft` não é compartilhado com o formulário de Nova Conta.
