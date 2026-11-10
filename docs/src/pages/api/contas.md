# `src/pages/api/contas.ts`

> REST de contas a pagar: listagem por período, criação, pagamento/cancelamento, atualização e exclusão.

## O que faz

- `GET ?ano=&mes=`: `ano` obrigatório; retorna `AccountDetails[]` por período.
- `POST`: `action: 'pagar'|'cancelar'` (exige `id`; 404 se não existir) ou criação — valida `distribuidora`, `valor` numérico, `vencimento` e `documento`; rejeita duplicidade distribuidora+documento.
- `PUT`: atualiza (valida campos; 404 se não existir).
- `DELETE { id }`: exclui; demais métodos → `405` (`Allow: GET, POST, PUT, DELETE`).

```ts
// POST criação
{ distribuidora, valor: number, vencimento, documento, bancoObservacoes? }
// POST ação
{ action: 'pagar' | 'cancelar', id }
```

## Relações

- **Usa:** `src/database/contasDb.ts`.
- **Usado por:** `contasService` e `../contas-a-pagar.md`.

## Notas

- Ações de pagamento usam `POST` + `action`, não sub-recursos.
- Duplicidade só é checada na criação (não no PUT).
