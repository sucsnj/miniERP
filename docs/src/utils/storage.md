# `src/utils/storage.ts`

> Helper de acesso ao `localStorage`.

## O que faz

- Centraliza leitura/escrita/remoção de valores no `localStorage`.
- Fornece leitura tipada para string e number com fallback.
- É seguro para SSR (retorna fallback quando `window` não existe).

## Relações

- **Usado por:** contextos, hooks e páginas que persistem preferências.

## Notas

- Evita acesso direto ao `localStorage` espalhado pelo código.
