# `src/pages/api/admin/merchants.ts`

> Administração de vendedores da empresa.

## O que faz

- `GET`: lista vendedores com lojas vinculadas.
- `POST`: cria merchant (`name`, `login`, `email`, `password`, `storeIds`).
- `PATCH`: altera `name`, `login`, `email`, `active`, `storeIds` e/ou `password`; desativa revoga sessões.

## Relações

- **Usa:** `requireAdminApi`, `src/database/adminRepository.ts`, `src/utils/password.ts`, `src/utils/serverAuth.ts`.
- **Usado por:** `/admin`.

## Notas

- `login` somente letras (mínimo 4); e-mail obrigatório e único; senha segue política.
- Não é possível promover merchant a admin.
