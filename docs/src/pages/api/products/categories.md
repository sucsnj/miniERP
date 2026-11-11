# `src/pages/api/produtos/categorias.ts`

> CRUD de categorias de produtos (`categorias` em `db/produtos.db`).

## O que faz

- `GET`: lista `[{ id, nome, descricao }]` ordenada por nome.
- `POST { nome, descricao? }` / `PUT ?id= { nome, descricao? }`: valida nome obrigatório e único (case-insensitive).
- `DELETE ?id=`: apaga; demais métodos → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).

## Relações

- **Usa:** `src/database/produtosDb.ts`.
- **Usado por:** `produtosService`; `../../cadastro.md` (modal de categoria).

## Notas

- `id=1` ("Geral") não pode ser atualizada/apagada; itens da categoria apagada migram para "Geral".
