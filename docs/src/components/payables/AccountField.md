# `src/components/payables/AccountField.tsx`

> Campo compartilhado de conta a pagar: leitura/edição em linha com rótulo e controle à direita.

## O que faz

- Renderiza rótulo e valor em linha (`label` à esquerda, controle/dado à direita), no mesmo padrão visual dos detalhes da conta.
- Em modo não editável, renderiza um botão valor para ativar edição na linha pai; com `canWrite={false}`, apresenta o valor como somente leitura.
- Suporta `text`, `number`, `date` e `textarea` em modo editável.

```ts
interface AccountFieldProps {
  label: string;
  value: string;
  displayValue?: string;
  editable: boolean;
  canWrite?: boolean;
  onChange: (value: string) => void;
  onActivate?: () => void;
  inputType?: 'text' | 'number' | 'date' | 'textarea';
  required?: boolean;
}
```

## Relações

- **Usa:** `payables.module.css`.
- **Usado por:** [PayablesAccountModal](./PayablesAccountModal.md) e [PayablesModals](./PayablesModals.md).

## Notas

- `onActivate` permite a ativação de edição inline diretamente ao clicar no valor do campo.
- Não exibe botão de editar quando `editable` é `true`; nesse estado renderiza o controle.
