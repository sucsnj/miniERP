# `src/pages/api/mensais.ts`

## Descrição

API de relatórios mensais de vendas consolidadas. Endpoint interno em `src/pages/api/mensais.ts`.

## Métodos

### `GET`

Busca dados mensais.

- **Com** `mes` e `ano` (query): retorna a linha de `vendas_mensais` do mês (ou `undefined`).
- **Sem** query: retorna todos os registros em `ano DESC, mes DESC`.
- **Erros**: 500 `{ error }`.

### `POST`

Executa consolidação mensal (`consolidateMonthly`).

- **Body**: `{ mes, ano }`.
- **Resposta 200**: `{ message: 'Consolidação realizada' }`.
- **Erros**: 500 `{ error: 'Erro na consolidação' }`.

### `DELETE`

Exclui um registro mensal.

- **Body**: `{ id }` (obrigatório).
- **Resposta 200**: `{ message: 'Mês excluído com sucesso' }`.
- **Erros**: 400 (id obrigatório), 500 `{ error, details }`.

## Observações

- Métodos não suportados retornam **405** com `Allow` header (`GET`, `POST`, `DELETE`).
- Usado pelo dashboard (`consolidarMensal`, `verificarConsolidado`) e pela página de resumo (`buscarTotalMensal`, `buscarTodosMensais`).
- A consolidação agrega `vendas_diarias` do mês em `vendas_mensais` (`db/vendas.db`), via `src/database/db.ts`.