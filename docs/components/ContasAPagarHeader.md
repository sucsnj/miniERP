# `src/components/ContasAPagarHeader.tsx`

## Descrição

Cabeçalho do módulo **Contas a pagar**: título, seletor de ano/mês e botão de **Backup Anual**.

## Contexto

Renderizado no topo de `contas-a-pagar.tsx`.

## Props

```ts
interface ContasAPagarHeaderProps {
  ano: number;
  mes: number;
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
  handleBackup: () => Promise<void>;
}
```

## Comportamento/Responsabilidades

- Campo **Ano** (input numérico): `onChange` usa `parseInt(...)` ou `today.year()` como fallback.
- Select **Mês** com 12 opções (`capitalize(formatMonthName(1..12))`).
- Botão **Backup Anual** (ícone `Backup`) → `handleBackup`.
- `today = now()` (timezone `America/Recife`).

## Dependências

- `src/utils/date` (`formatMonthName`, `now`), `src/utils/captalize` (`capitalize`).
- `src/styles/contas.module.css`; `@mui/icons-material` (`Backup`).

## Observações

- Não possui estado interno; não navega para menu (responsabilidade está no `Nav` global).