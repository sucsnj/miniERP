# `src/pages/api/notas.ts`

## Descrição

Endpoint REST de **notas fiscais importadas**: consulta por período, por ID, por valor, criação e exclusão. Delega para `src/database/notasDb.ts`.

## Métodos

### `GET /api/notas`

Query: `ano` (obrigatório para consulta por período), `mes` (opcional), `id` ou `valor` (alternativos ao período).

- `id` → 200 com a nota via `getNotasById`; **404** `{ error: 'Nota não encontrada' }` se não existir.
- `valor` → 200 com a nota via `getNotasByValor(parseNumber(valor))`; **404** `{ error: 'Nenhuma nota encontrada com esse valor' }`.
- Período: **400** `{ error: 'Ano é obrigatório' }` se faltar `ano`; senão `getNotasByPeriod(ano, mes?)`.
  - **Quirk:** antes de responder, a rota chama `getAllNotas()`; se **não existe nenhuma nota** no banco, retorna `200 []` mesmo quando o período teria resultados. Com notas existentes, retorna o resultado do período (pode ser `[]` legítimo).
- Resposta 200: `NotaDetalhe[]` (ou objeto isolado nos casos `id`/`valor`).

### `POST /api/notas`

Body: `{ distribuidora, chave, dataEmissao, valorNota }`.

- **400** `{ error: 'Data de emissão e valor da nota são obrigatórios' }` se qualquer um dos 4 campos faltar (mensagem imprecisa — não é só emissão/valor).
- Sucesso → `201 { id: lastInsertRowid }` via `insertNota`.

### `DELETE /api/notas`

Body: `{ id }`.

- **400** `{ error: 'ID é obrigatório para exclusão' }` sem `id`.
- Sucesso → `200 { changes }` via `deleteNota(parseInt(id))`.

### Outros métodos

- **405** com `Allow: GET, POST, DELETE`.

## Observações

- `id`/`valor` na query são convertidos com `parseInt`/`parseNumber` sem validação de erro — valores inválidos caem em 404 naturalmente.
- Não há `PUT` para editar nota; a exclusão manual é o único caminho de correção (a reimportação no XML recria).
- O cliente `src/services/notasService.ts` é usado apenas por `NotasDoMes.tsx`.