# `src/pages/api/admin/stores.ts`

> Administração das lojas da empresa atual.

## O que faz

- `GET`: lista lojas (`id`, `name`, telefone, CPF/CNPJ, `address_street`, `address_number`, `address_district`, `active`).
- `POST`: cria loja (somente `name`).
- `PATCH`: atualiza dados completos da loja ou status; ao desativar, chama a função transacional `deactivate_store`.
- Valida CPF/CNPJ e telefone da loja.

## Relações

- **Usa:** `requireAdminApi`, `isValidName`, `normalizeName`, `adminRepository`, `normalizeStoreProfile`.
- **Usado por:** `src/hooks/useAdmin.ts`.

## Notas

- Máximo de 2 lojas por empresa.
- Nome e status da loja seguem as regras: pelo menos 1 loja ativa.
- Novos campos são opcionais e ficam vazios até preenchimento.
