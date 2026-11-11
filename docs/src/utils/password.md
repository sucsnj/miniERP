# `src/utils/password.ts`

> Hash, verificação e validação de senhas/login.

## O que faz

- Valida `login`: mínimo 4 caracteres e apenas letras.
- Valida senha: 8–128 caracteres, sem espaços/controle, com letras, números e ao menos um caractere especial seguro.
- Gera hash `scrypt$N$r$p$salt$hash` com salt aleatório.
- Verifica senha com `crypto.timingSafeEqual`.

## Relações

- **Usa:** `node:crypto`.
- **Usado por:** `src/pages/api/auth/bootstrap.ts`, `src/pages/api/auth/login.ts`, `src/pages/api/auth/change-password.ts`.

## Notas

- O formato de hash é versionado no prefixo `scrypt`.
