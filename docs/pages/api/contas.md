# `src/pages/api/contas.ts`

## Descrição

Endpoint REST de **contas a pagar**: listagem por período, criação, pagamento, cancelamento de pagamento, atualização e exclusão.

## Métodos

### `GET /api/contas?ano=YYYY&mes=M`

- `ano` obrigatório (400 `{ error: 'Ano é obrigatório' }` se ausente); `mes` opcional.
- Retorna `200` com `ContaDetalhe[]` (via `getContasByPeriod`).

### `POST /api/contas`

Body: `{ action?, id?, distribuidora?, valor?, vencimento?, documento?, bancoObservacoes? }`.

- `action: 'pagar'` → exige `id` (400 se faltar); conta inexistente → 404; chama `payConta`; retorna `{ message: 'Conta marcada como Pago' }`.
- `action: 'cancelar'` → exige `id` (400); 404 se não existir; chama `cancelPaymentConta`; retorna `{ message: 'Pagamento cancelado e conta voltou a Pendente' }`.
- Sem `action` (criação): valida `distribuidora`, `valor` (`typeof === 'number'`), `vencimento`, `documento` (400 `{ error: 'Dados inválidos para criação de conta' }`). **Duplicidade:** se já existe conta com a mesma `distribuidora` E `documento`, retorna 400.

### `PUT /api/contas`

Body: `{ id, distribuidora, valor, vencimento, documento, bancoObservacoes }`.

- Valida campos + `id` (400); 404 se a conta não existir; chama `updateConta`.
- Retorna `{ message: 'Conta atualizada com sucesso' }`.

### `DELETE /api/contas`

Body: `{ id }`.

- 400 sem `id`; 404 se não existir; chama `deleteConta`; retorna `{ message: 'Conta excluída com sucesso' }`.

### Outros métodos

- 405 com `Allow: GET, POST, PUT, DELETE`.

## Observações

- Ações de pagamento são modeladas como `POST` + `action`, não como sub-recursos.
- A duplicidade só é verificada na criação (não no PUT).
- Valores numéricos: o front envia número; `bancoObservacoes` é opcional.