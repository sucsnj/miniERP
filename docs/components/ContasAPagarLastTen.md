# `src/components/ContasAPagarLastTen.tsx`

## Descrição

Exibe as **últimas 10 contas registradas** (tabela compacta) com ações de Ver, Excluir (com confirmação) e Editar.

## Contexto

Renderizado em `contas-a-pagar.tsx`. A **seleção das 10 mais recentes** (por `criado_em` decrescente) é feita no `useMemo` `ultimasContas` da página — o componente apenas renderiza a lista recebida.

## Props

```ts
interface ContasAPagarLastTenProps {
  ultimasContas: ContaDetalhe[];
  handleView: (conta: ContaDetalhe) => void;
  handleDelete: (id: number) => void;
  handleEditar: (conta: ContaDetalhe) => void;
}
```

## Comportamento/Responsabilidades

- Tabela compacta: **Vencimento** (`formatDateString` 'DD/MM/YYYY'), **Distribuidora**, **Valor** (`formatCurrency`) e **Ações**.
- Ações: "Ver" (ícone olho), "Excluir" (ícone lixeira → `ConfirmDialog` local `confirmOpen`/`selectedId`), "Editar" (ícone lápis → `handleEditar`).
- Estado vazio: "Nenhuma conta registrada ainda.".

## Dependências

- `src/utils/date` (`formatDateString`), `src/utils/formatter` (`formatCurrency`).
- `ConfirmDialog`, `src/styles/contas.module.css`, `@mui/icons-material` (`Visibility`, `Delete`, `Edit`).

## Observações

- O limite de 10 registros não é aplicado aqui — vem pronto do pai.
- Reutiliza o mesmo padrão de `ConfirmDialog` do `ContasAPagarFilterPanel`.