# `src/pages/api/admin/merchants.ts`

> Administração de vendedores da empresa atual.

## O que faz

- `GET`: lista vendedores e lojas autorizadas.
- `POST`: cria vendedor (`name`, `login`, `email`, `password`, `storeIds`).
- `PATCH`: atualiza vendedor (`name`, `login`, `email`, `active`, `storeIds`, `password`).

## Relações

- **Usa:** `requireAdminApi`, `validateLogin`, `validatePassword`, `adminRepository`.
- **Usado por:** `src/hooks/useAdmin.ts`.

## Notas

- Foto de vendedor é alterada somente via [`/api/avatar`](../avatar.md), com upload do dispositivo e limite de 5 MB.
- O endpoint não aceita URL manual nem data URI pequena; ela foi removida para evitar burlar o limite/mime-type.
- `login` somente letras (mínimo 4); e-mail obrigatório e único.
