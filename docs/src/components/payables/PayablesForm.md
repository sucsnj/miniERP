# `src/components/payables/PayablesForm.tsx`

> Formulário de cadastro/edição de contas a pagar.

## O que faz

- Campos Distribuidora, Valor (`step=0.01`), Vencimento, Documento e Banco/Observações.
- Ações: "Cadastrar Conta"/"Salvar Alteração" (edição), "Limpar Campos", "Importar XML" e "Cancelar" (edição).
- Expõe refs dos inputs ao pai (foco/validação).

```ts
interface PayablesFormProps {
  distributor: string; amount: string; dueDate: string; document: string;
  bankNotes: string; editingAccount: AccountDetails | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onReset: () => void; onImportXML: () => Promise<void>; onCancelEdit: () => void;
  distributorInputRef; amountInputRef; dataInputRef; documentInputRef;
}
```

## Relações

- **Usa:** `AccountDetails` (`src/services/contasService.ts`), `contas.module.css`, ícones MUI.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- Apresentacional: validação e chamadas de API ficam na página.
