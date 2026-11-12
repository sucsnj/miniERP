# `src/pages/api/stores.ts`

> Lojas autorizadas para o usuário atual.

## O que faz

- `GET`: lista lojas ativas do tenant visíveis ao usuário (admin: todas; merchant: `user_stores`) e informa `currentStoreId`.
- `POST`: valida acesso à loja, atualiza `sessions.store_id` e `users.last_store_id`, e retorna `{ store, user }` com `storeId`/`storeName` já atualizados.

## Relações

- **Usa:** `src/utils/serverAuth.ts`.
- **Usado por:** navegação (seletor de loja).

## Notas

- Loja inexistente/outra empresa/não autorizada retorna `403`.
