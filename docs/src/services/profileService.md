# `src/services/profileService.ts`

> Cliente HTTP via `fetch` para os dados e senha do perfil do administrador.

## O que faz

- `updateProfile(patch)` (`PATCH /api/auth/profile`).
- `updateProfileContact(patch)` (`PATCH /api/auth/profile` com `{ contact }`).
- `changeProfilePassword(patch)` (`POST /api/auth/profile/password`).
- `fetchJson` propaga `Error` em respostas não OK com mensagem legível.

## Relações

- **Usa:** APIs `/api/auth/profile*`.
- **Usado por:** `src/pages/profile.tsx`.

## Notas

- A troca de senha devolve um `AuthUser` com o contexto renovado após a revogação de sessões.
- Uploads de foto vivem em `avatarService.ts`.
