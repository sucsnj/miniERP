# `src/pages/api/avatar.ts`

> Upload de foto de usuário para Supabase Storage.

## O que faz

- `POST` (admin-only): aceita JSON `{ dataUrl }` e `{ userId? }`; `userId` ausente usa o próprio admin.
- Valida MIME type (`image/png`, `image/jpeg`, `image/gif`, `image/webp`) e conteúdo de até 5 MB.
- Envia a imagem para o bucket público `avatars`, path `<companyId>/<targetUserId>/avatar-<timestamp>.<ext>`.
- Atualiza `users.avatar_url` com a URL pública; alvo deve pertencer ao mesmo tenant.
- Remove o avatar anterior pertencente ao mesmo tenant/usuário quando possível.
- Quando o alvo é o usuário da sessão, devolve o contexto atualizado (`user`).

## Relações

- **Usa:** `requireAdminApi`, `getAuthContext`, `getSupabaseServerClient`.
- **Usado por:** `src/services/avatarService.ts`.

## Notas

- `bodyParser` de JSON está limitado a 8 MB para acomodar o data URL.
- Requer bucket `avatars` (migration `0019-create-avatars-storage-bucket.sql`).
- O servidor valida novamente o tamanho do arquivo, independentemente do cliente.
