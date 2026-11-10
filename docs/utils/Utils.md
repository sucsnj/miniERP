# `src/utils`

## Descrição

Pacote de utilitários usados em toda a aplicação para formatação, parsing e limpeza de dados.

## Módulos

- `captalize.tsx` - funções de capitalização de texto.
- `cleaner.tsx` - limpeza de arquivos temporários `temp`.
- `date.ts` - datas em `America/Recife`: `now`, `parseDate` (Dayjs), `toDate` (Date), `toTimestamp`, formatadores e nomes de meses.
- `edit.ts` - **regra de negócio** de edição de vendas com limite de 2 dias (`canEdit`) — fora do módulo de validação (ADR 0002).
- `formatter.tsx` - formatação de valores monetários.
- `forms.tsx` - manipulação de DOM/UI: realce de campo obrigatório (`highlightField`) e mostrar/ocultar campos — **sem lógica de validação** (ADR 0002).
- `number.ts` - parsing de números: `parseNumber` e `parseCurrency` (normalizadores desacoplados da validação).
- `pix.ts` - geração de payload PIX EMVCo (TLV, CRC16) e validação de chaves PIX (ver `docs/components/Pix.md`).
- `shortcuts.tsx` - atalhos de teclado.
- `validation.ts` - validações centralizadas de campos no contrato `{ ok, message }` (ADR 0002): `validateRequired`, `validateEmail`, `validateCurrency`, `validateNumber`, `validateDate`.

## Observações

- `date.ts` usa apenas `dayjs` (com plugin `utc`/`timezone` e locale pt-BR) no timezone `America/Recife`.
- `cleaner.tsx` é usado apenas no backend para remover arquivos temporários.
- `validation.ts` expõe **somente validação** `{ ok, message }` (mensagens pt-BR hardcoded); parsing e regras de negócio ficam em `number.ts`/`date.ts`/`edit.ts` (ver `docs/adr/0002-padrao-de-validacao-de-campos.md`).
