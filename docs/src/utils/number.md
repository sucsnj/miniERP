# `src/utils/number.ts`

> Normalização e parsing de números e valores monetários.

## O que faz

- `parseNumber(value)` (default) converte `number`/`string` em `number`, tratando padrão BR (milhar `.`, decimal `,`); inválido → `NaN`.
- `parseCurrency(value)` limpa a entrada monetária e retorna `number | null`.
- Desacoplados da validação: não emitem mensagens.

## Relações

- **Usado por:** `validation`, `useDailySaleForm` e endpoints (`api/vendas`, `api/produtos`, `api/notas`, `api/contas/import`, página `cadastro`).
