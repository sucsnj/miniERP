# `src/pages/api/products/marcas.ts`

> CRUD de marcas (`marcas` em `db/products.db`).

## O que faz

- `GET`: lista `[{ id, nome }]` ordenada por nome.
- `POST { nome }` / `PUT ?id= { nome }`: valida nome obrigatório e único (case-insensitive).
- `DELETE ?id=`: apaga; demais métodos → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).

## Relações

- **Usa:** `src/database/productsDb.ts`.
- **Usado por:** `productsService`; `../../registration.md` (modal de marca).

## Notas

- `id=1` ("Outros") não pode ser atualizada/apagada; itens migram para ela.
