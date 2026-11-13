# `src/pages/admin.tsx`

> Administração da empresa (`/admin`).

## O que faz

- Permite ao admin atualizar o nome da empresa; o `AuthContext` é reutilizado pela navegação após alteração.
- Permite criar/editar/desativar até 2 lojas; impacta a sessão atual quando necessário.
- Redefine senha de vendedores via modal validável (confirmação + política mínima), sem `window.prompt`.
- Cards responsivos no mesmo layout grid de `/profile`, com controles compactos de edição inline.
- Foto de vendedores é escolhida do dispositivo via `AvatarPicker` (PNG, JPEG, GIF ou WebP, até 5 MB); não há campo de URL manual.
- Permite criar/editar vendedores, loja(s) autorizada(s), ativar/inativar, redefinir senha e escolher foto.

## Relações

- **Usa:** `RequireAdmin`, `AvatarPicker`, `avatarService`, `useAdmin`, `adminService`.
- **Usado por:** rota `/admin` (somente admin; link na Nav).

## Notas

- `AuthContext` é renovado após alterações de empresa e lojas, evitando nome/loja desatualizados.
- Não há exclusão definitiva de loja/vendedor.
