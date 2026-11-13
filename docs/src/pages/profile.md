# `src/pages/profile.tsx`

> Perfil do administrador autenticado (`/profile`): foto, dados pessoais e senha.

## O que faz

- Somente administradores acedem (`RequireAdmin`).
- Altera foto do usuário via upload de imagem no dispositivo; aceita PNG, JPEG, GIF e WebP de até 5 MB.
- Atualiza nome, apelido (`login`) e e-mail do administrador.
- Altera a senha mediante senha atual e validação do servidor.

## Relações

- **Usa:** `RequireAdmin`, `useAuth`, `profileService`, componentes comuns.
- **Acessada por:** menu de usuário da [Nav](../components/common/Nav.md).

## Notas

- A foto é enviada como data URL e persistida no Supabase Storage (`avatars`), com URL pública em `users.avatar_url`.
- O apelido persiste no campo `login` da tabela `users`.
- A troca de senha revoga sessões anteriores e mantém a sessão devolvida pela API.
