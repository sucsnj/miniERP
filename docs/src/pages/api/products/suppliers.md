# `src/pages/api/products/fornecedores.ts`

> CRUD de fornecedores (`fornecedores` em `db/products.db`).

## O que faz

- `GET`: lista `[{ id, nome }]` ordenada por nome.
- `POST { nome }` / `PUT ?id= { nome }`: valida nome obrigatório e único (case-insensitive).
- `DELETE ?id=`: apaga; demais métodos → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).

## Relações

- **Usa:** `src/database/productsDb.ts`.
- **Usado por:** `productsService`; `../../registration.md` (modal de fornecedor).

## Notas

- `id=1` ("Sem fornecedor") não pode ser atualizado/apagado; itens migram para ele.
