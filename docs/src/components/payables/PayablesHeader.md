# `src/components/payables/PayablesHeader.tsx`

> Cabeçalho de Contas a Pagar: título, seletores de ano/mês e Backup Anual.

## O que faz

- Input **Ano** (`parseInt` com fallback para o ano atual) e select **Mês** (12 opções).
- Botão **Backup Anual** chama `handleBackup`.

```ts
interface PayablesHeaderProps {
  year: number; month: number;
  setYear: (year: number) => void; setMonth: (month: number) => void;
  handleBackup: () => Promise<void>;
}
```

## Relações

- **Usa:** `formatMonthName`/`now` (`src/utils/date.ts`), `capitalize` (`src/utils/captalize.tsx`), `contas.module.css`.
- **Usado por:** `../../pages/contas-a-pagar.md`.

## Notas

- Sem estado interno; datas em `America/Recife` via `now()`.
