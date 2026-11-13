# `src/utils/number.ts`

> Normalização e parsing de números e valores monetários.

## O que faz

- `parseNumber(value)` (default) converte `number`/`string` em `number`, tratando estritamente o padrão BR com milhar `.` e decimal `,` (`1.234,56`) e o decimal internacional (`1234.56`); entradas com trailing garbage, `e/E` e `0x` são rejeitadas (`NaN`).
- `parseCurrency(value)` usa as mesmas regras de parsing estrito e retorna `number | null`.
- Desacoplados da validação: não emitem mensagens.

## Relações

- **Usado por:** `validation`, `useDailySaleForm` e endpoints (`api/vendas`, `api/products`, `api/notas`, `api/contas/import`, página `cadastro`).
