# `src/pages/admin.tsx`

> Administração da empresa (`/admin`).

## O que faz

- Permite ao admin atualizar o nome da empresa; o `AuthContext` é reutilizado pela navegação após alteração.
- Permite criar/editar/desativar até 2 lojas; impacta a sessão atual quando necessário.
- Redefine senha de vendedores via modal validável (confirmação + política mínima), sem `window.prompt`.
- `avatarUrl` de vendedores é limitado a 1024 caracteres; data URI restrita a imagens pequenas e sem SVG.
- Permite criar/editar vendedores, loja(s) autorizada(s), ativar/inativar, redefinir senha e informar URL de foto.

## Relações

- **Usa:** `RequireAdmin`, APIs `/api/admin/*`.
- **Usado por:** rota `/admin` (somente admin; link na Nav).

## Notas

- `AuthContext` é renovado após alterações de empresa e lojas, evitando nome/loja desatualizados.
- Não há exclusão definitiva de loja/vendedor.
