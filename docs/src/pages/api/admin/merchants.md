# `src/pages/api/admin/merchants.ts`

> Administração de vendedores da empresa.

## O que faz

- `GET`: lista vendedores com lojas vinculadas.
- `POST`: cria merchant (`name`, `login`, `email`, `password`, `storeIds`).
- `POST`/`PATCH`: aceita `avatarUrl` opcional (URL http/https, path absoluto com no máximo 1024 caracteres) ou uma pequena data URI de imagem `png|jpg|gif|webp` (sem SVG); URLs maiores são rejeitadas com 400.

## Relações

- **Usa:** `requireAdminApi`, `src/database/adminRepository.ts`, `src/utils/password.ts`, `src/utils/serverAuth.ts`.
- **Usado por:** `/admin`.

## Notas

- `login` somente letras (mínimo 4); e-mail obrigatório e único; senha segue política.
- Não é possível promover merchant a admin.
