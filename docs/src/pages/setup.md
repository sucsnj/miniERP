# `src/pages/setup.tsx`

> Página de bootstrap do primeiro administrador.

## O que faz

- Consulta `/api/auth/bootstrap` (`GET`) para saber se ainda é possível criar o primeiro admin.
- Exige `PIN_MASTER`, empresa, primeira loja, nome, login, e-mail e senha.
- Envia para `/api/auth/bootstrap` e autentica o admin criado.

## Relações

- **Usa:** `src/contexts/AuthContext.tsx`, `src/components/common/Button.tsx`, Next Link.
- **Usado por:** rota `/setup`; disponível apenas quando `count(users) = 0`.

## Notas

- O PIN_MASTER nunca é exposto como `NEXT_PUBLIC_*`.
