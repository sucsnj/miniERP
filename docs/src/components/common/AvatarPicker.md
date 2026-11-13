# `src/components/common/AvatarPicker.tsx`

> Componente reutilizável para escolher foto de usuário do dispositivo.

## O que faz

- Renderiza avatar arredondado com `img` ou inicial em fallback.
- Botão para abrir seletor de arquivo com `accept` para PNG, JPEG, GIF e WebP.
- Valida tipo e tamanho (5 MB) via `avatarService`.
- Exibe loading no botão durante upload.
- Usa `useToast` para erros de validação/upload.

## Relações

- **Usa:** `avatarService.ts`, `Button`, `useToast`.
- **Usado por:** `src/pages/profile.tsx`, `src/pages/admin.tsx`.

## Notas

- Aceita imagem do dispositivo; não aceita URL manual.
- Não armazena a imagem; recebe callback `onUpload(file)`.
