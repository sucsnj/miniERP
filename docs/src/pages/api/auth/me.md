# `src/pages/api/auth/me.ts`

> Sessão atual.

## O que faz

- `GET`: devolve `{ user }` com contexto da sessão autenticada.
- Sem sessão válida, devolve `401`.

## Relações

- **Usa:** `src/utils/serverAuth.ts`.
- **Usado por:** `AuthGate`, `AuthContext`.

## Notas

- É a fonte server-side do contexto; o cliente não envia `companyId`/`storeId`.
