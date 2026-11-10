# `src/components/common/Dialog.tsx`

> Diálogo compartilhado renderizado via portal.

## O que faz

- Renderiza backdrop e container acessível quando `open`.
- Exibe título opcional e conteúdo em `children`.
- Usa `dialog.module.css`.

```ts
interface DialogProps {
  open: boolean;
  title?: string;
  titleId?: string;
  children: React.ReactNode;
  onClose?: () => void;
}
```

## Relações

- **Usa:** `dialog.module.css`.
- **Usado por:** componentes que precisam de modal padronizado.

## Notas

- Primitiva criada na Fase 2 do ADR 0007; `ConfirmDialog` permanece especializado.
