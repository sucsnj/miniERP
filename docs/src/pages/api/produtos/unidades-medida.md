# `src/pages/api/produtos/unidades-medida.ts`

> CRUD de unidades de medida (`unidades_medida` em `db/produtos.db`).

## O que faz

- `GET`: lista `[{ id, sigla, descricao }]` ordenada por sigla.
- `POST { sigla, descricao? }` / `PUT ?id= { sigla, descricao? }`: valida sigla obrigatória e única.
- `DELETE ?id=`: apaga; demais métodos → `405` (`Allow: GET, POST, DELETE, PUT, PATCH`).

## Relações

- **Usa:** `src/database/produtosDb.ts`.
- **Usado por:** `produtosService`; `../../cadastro.md` (modal de unidade de medida).

## Notas

- `id=1` ("UN") não pode ser apagada; siglas de `seedUoms` não podem ser atualizadas; itens migram para `UN`.
