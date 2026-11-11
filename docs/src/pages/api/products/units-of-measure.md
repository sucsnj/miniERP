# `src/pages/api/products/units-of-measure.ts`

> CRUD de unidades de medida (`unidades_medida` em `db/products.db`).

## O que faz

- `GET`: lista `[{ id, sigla, descricao }]` ordenada por abbreviation.
- `POST { sigla, descricao? }` / `PUT ?id= { sigla, descricao? }`: valida abbreviation obrigatória e única.
- `DELETE ?id=`: apaga; demais métodos → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).

## Relações

- **Usa:** `src/database/productsDb.ts`.
- **Usado por:** `productsService`; `../../registration.md` (modal de unit de medida).

## Notas

- `id=1` ("UN") não pode ser apagada; siglas de `seedUoms` não podem ser atualizadas; itens migram para `UN`.
