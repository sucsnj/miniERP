# `src/pages/api/admin/company.ts`

> Administração dos dados da empresa atual.

## O que faz

- `GET`: retorna empresa (`id`, `name`, endereço, telefone e CPF/CNPJ) do tenant atual.
- `PATCH` (admin-only): atualiza dados completos de empresa (nome, telefone, CPF/CNPJ, endereço com logradouro, número, complemento, bairro, cidade, UF e CEP).
- Valida CPF/CNPJ, telefone, UF e CEP.

## Relações

- **Usa:** `requireAdminApi`, `adminRepository`, `normalizeCompanyProfile`, `invalidateCompanyNameCache`.
- **Usado por:** `src/hooks/useAdmin.ts`.

## Notas

- O nome é obrigatório; demais campos são opcionais.
- Campos vazios são preservados como strings vazias.
