# `src/services/avatarService.ts`

> Cliente e validação de upload de fotos do dispositivo.

## O que faz

- `validateAvatarFile(file)` valida tipo (`image/png`, `image/jpeg`, `image/gif`, `image/webp`) e tamanho máximo (5 MB).
- `AVATAR_MAX_FILE_SIZE` centraliza o limite.
- `uploadAvatar(file, targetUserId?)` converte o arquivo para data URL e chama `POST /api/avatar`.
- Define `AvatarUploadResponse`: `avatarUrl`, `userId` e, quando o alvo é o usuário logado, `user` atualizado.

## Relações

- **Usa:** [`/api/avatar`](../pages/api/avatar.md).
- **Usado por:** `src/components/common/AvatarPicker.tsx`, `src/pages/profile.tsx`, `src/pages/admin.tsx`.

## Notas

- O tamanho é validado no cliente e novamente no servidor.
- O data URL suporta a troca de fotos tanto do admin atual quanto de vendedores gerido pelo admin.
