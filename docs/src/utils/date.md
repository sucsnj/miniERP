# `src/utils/date.ts`

> Datas e horários no timezone `America/Recife`, sobre `dayjs`.

## O que faz

- `now()` devolve o "agora" em Recife; `parseDate(value)` respeita offset existente e converte para o TZ.
- Conversão/formatos: `toDate`, `toDateFromISO`, `toTimestamp`, `formatDateString`, `formatDateISO`, `formatMonthName`.
- Comparações: `isAfter`, `isBefore`; arrays: `getDateArray`, `getTimeArray`, `getDateTimeArray`.
- Auxiliares: `getLastDayOfMonth`, `getCurrentYear`.

## Relações

- **Usa:** `dayjs` (+ plugins `utc`/`timezone` e locale `pt-br`).
- **Usado por:** páginas, componentes, `database/*` e `services/*`.
