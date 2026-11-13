# `src/utils/businessProfile.ts`

> Normalização e validação de dados cadastrais de empresa e loja.

## O que faz

- `normalizeCompanyProfile`: valida/normaliza `name`, telefone, CPF/CNPJ, logradouro, número, complemento, bairro, cidade, UF e CEP; exige strings estritas (campos vazios permitidos; `null`/incorreto rejeitado).
- `normalizeStoreProfile`: valida/normaliza `name`, telefone, CPF/CNPJ, logradouro, número e bairro; exige strings estritas (`null`/tipos incorretos rejeitados).
- `normalizeContactProfile`: valida/normaliza telefone e endereço do usuário (logradouro, número, complemento, bairro, cidade, UF, CEP); exige strings estritas.
- Telefone passa por lista de dígitos/length (10–13); CPF/CNPJ exigem 11/14 dígitos válidos; UF é uppercased e validada contra UFs brasileiras; CEP é normalizado para `00000-000`.
- Nenhum campo aceita objetos/booleanos; apenas strings vazias são consideradas "limpar campo" explícito.

## Relações

- **Usa:** `src/utils/pix.ts` (`isValidCpf`/`isValidCnpj`).
- **Usado por:** `src/pages/api/admin/company.ts`, `src/pages/api/admin/stores.ts`, `src/pages/admin.tsx`.

## Notas

- O nome deve ter entre 2 e 120 caracteres.
- Campos opcionais vazios são persistidos como string vazia.
- CPF/CNPJ usam dígitos verificadores.
