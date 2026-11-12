# `src/pages/admin.tsx`

> Administração da empresa (`/admin`).

## O que faz

- Permite ao admin atualizar o nome da empresa.
- Permite criar/editar/desativar até 2 lojas.
- Permite criar/editar vendedores, loja(s) autorizada(s), ativar/inativar e redefinir senha.

## Relações

- **Usa:** `RequireAdmin`, APIs `/api/admin/*`.
- **Usado por:** rota `/admin` (somente admin; link na Nav).

## Notas

- Admin não cria outra empresa; uma empresa por admin.
- Não há exclusão definitiva de loja/vendedor.
