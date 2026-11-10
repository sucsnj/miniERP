# `src/components/ContasAPagarForm.tsx`

## Descrição

Formulário de **cadastro/edição** de contas a pagar, com botões de cadastrar/salvar, limpar, importar XML e cancelar edição.

## Contexto

Renderizado em `contas-a-pagar.tsx`, abaixo do painel de filtros. Validação fica no pai (`handleSubmit`); o componente é controlado.

## Props

```ts
interface ContasAPagarFormProps {
  distribuidora: string;       setDistribuidora: (value: string) => void;
  valor: string;               setValor: (value: string) => void;
  vencimento: string;          setVencimento: (value: string) => void;
  documento: string;           setDocumento: (value: string) => void;
  bancoObservacoes: string;    setBancoObservacoes: (value: string) => void;
  editingConta: ContaDetalhe | null;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onReset: () => void;
  onImportXML: () => Promise<void>;
  onCancelarEdicao: () => void;
  distribuidoraInputRef: React.RefObject<HTMLInputElement | null>;
  valorInputRef: React.RefObject<HTMLInputElement | null>;
  dataInputRef: React.RefObject<HTMLInputElement | null>;
  documentoInputRef: React.RefObject<HTMLInputElement | null>;
}
```

## Comportamento/Responsabilidades

- Campos: **Distribuidora** (texto), **Valor** (com `step="0.01"`), **Vencimento** (`type="date"`), **Documento** (texto) — numa linha — e **Banco / Observações** (textarea 4 linhas).
- Ações: botão principal **"Cadastrar Conta"** → **"Salvar Alteração"** quando `editingConta`; **"Limpar Campos"** (`onReset`); **"Importar XML"** (`onImportXML`); botão **"Cancelar"** extra quando em edição (`onCancelarEdicao`).
- Refs ligadas aos inputs para `highlightField`/foco do pai.

## Dependências

- `src/services/contasService` (tipo `ContaDetalhe`), `src/styles/contas.module.css`, `@mui/icons-material` (`NoteAdd`, `ClearAll`, `ImportExport`).

## Observações

- Componente de apresentação; toda a lógica (validação, chamada à API) vive na página.