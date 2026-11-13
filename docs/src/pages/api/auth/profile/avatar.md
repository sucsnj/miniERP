# `src/pages/api/auth/profile/avatar.ts`

> Upload/atualização da foto de perfil do administrador autenticado.

## O que faz

- `POST` (admin-only) com JSON `{ dataUrl }`.
- Valida MIME type (`image/png`, `image/jpeg`, `image/gif` ou `image/webp`) e conteúdo de no máximo 5 MB.
- Envia o arquivo para o bucket público `avatars` no Supabase Storage, path `<companyId>/<userId>/avatar-<timestamp>.<ext>`.
- Atualiza `users.avatar_url` com a URL pública e devolve o contexto renovado.
- Remove o avatar anterior pertencente ao mesmo bucket/path quando possível.

## Relações

- **Usa:** `requireAdminApi`, `getAuthContext`, `getSupabaseServerClient`.
- **Usado por:** `src/services/profileService.ts`.

## Notas

- Requer o bucket `avatars` (migration `0019-create-avatars-storage-bucket.sql`).
- `bodyParser` de JSON está limitado a 8 MB para acomodar o data URL.
- Storage é usado somente para fotos de perfil; o banco guarda apenas a URL.
