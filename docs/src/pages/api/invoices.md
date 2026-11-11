# `src/pages/api/notas.ts`

> REST de notas fiscais importadas: consulta, criação e exclusão.

## O que faz

- `GET`: por `id` (404 se não existir), por `valor` (404 se não encontrar) ou por período (`ano` obrigatório + `mes` opcional).
- `POST { distribuidora, chave, dataEmissao, valorNota }`: cria e responde `201 { id }`.
- `DELETE { id }`: exclui e responde `200 { changes }`; demais métodos → `405` (`Allow: GET, POST, DELETE`).

## Relações

- **Usa:** `src/database/notasDb.ts`, `parseNumber` de `src/utils/number.ts`.
- **Usado por:** importação em `./contas/import.md` e `notasService` (via `summary/MonthNotes.tsx`).

## Notas

- Quirk: no GET por período, se o banco não tem nenhuma nota, retorna `200 []` mesmo havendo resultados no período.
- Não há `PUT`; correção é via exclusão/reimportação.
