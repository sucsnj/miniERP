# `src/utils/businessProfile.ts`

> Normalização e validação de dados cadastrais de empresa e loja.

## O que faz

- `normalizeCompanyProfile`: valida/normaliza `name`, telefone, CPF/CNPJ, logradouro, número, complemento, bairro, cidade, UF e CEP.
- `normalizeStoreProfile`: valida/normaliza `name`, telefone, CPF/CNPJ, logradouro, número e bairro.
- CEP é normalizado para `00000-000`; UF é uppercased e validada contra UFs brasileiras.
- Telefone e CPF/CNPJ são normalizados/validados antes do persistir.

## Relações

- **Usa:** `src/utils/pix.ts` (`isValidCpf`/`isValidCnpj`).
- **Usado por:** `src/pages/api/admin/company.ts`, `src/pages/api/admin/stores.ts`, `src/pages/admin.tsx`.

## Notas

- O nome deve ter entre 2 e 120 caracteres.
- Campos opcionais vazios são persistidos como string vazia.
- CPF/CNPJ usam dígitos verificadores.
