# `src/services/profileService.ts`

> Cliente HTTP via `fetch` para perfil do administrador.

## O que faz

- `updateProfile(patch)` (`PATCH /api/auth/profile`).
- `changeProfilePassword(patch)` (`POST /api/auth/profile/password`).
- `uploadProfileAvatar(file)` (`POST /api/auth/profile/avatar`); valida tipo e tamanho (até 5 MB) antes de ler como data URL.
- `fetchJson` propaga `Error` em respostas não OK com mensagem legível.

## Relações

- **Usa:** APIs `/api/auth/profile*`.
- **Usado por:** `src/pages/profile.tsx`.

## Notas

- A foto aceita apenas PNG, JPEG, GIF e WebP.
- A troca de senha devolve um `AuthUser` com o contexto renovado após a revogação de sessões.
