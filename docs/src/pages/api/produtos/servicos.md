# `src/pages/api/produtos/servicos.ts`

> REST de serviços do catálogo (`servicos` em `db/produtos.db`).

## O que faz

- `GET`: sem `id`, listagem paginada (`search`, `categoria_id`, `page`, `pageSize`); com `?id=`, retorna o serviço ou `null`.
- `POST`: cria serviço (nome e categoria obrigatórios); responde `201` com o serviço.
- `PUT ?id=` / `DELETE ?id=`: atualiza/exclui (`404` se não existir).
- Demais métodos → `405 { error: 'Método não permitido.' }`.

```ts
{ nome, descricao?, categoria_id, preco_venda?, codigo_interno?, referencia?, duracao_minutos? }
```

## Relações

- **Usa:** `src/database/produtosDb.ts` (`getServices`, `insertService`, `updateService`, `deleteService`).
- **Usado por:** `produtosService`; `../../produtos.md` e `../../cadastro.md`.

## Notas

- `normalizeServicePayload` trima strings e converte números (fallback 0).
- `insertService` grava o próprio ID como `codigo_interno` quando vazio.
