# `src/components/common/Form.tsx`

> Formulário padrão com espaçamento vertical.

## O que faz

- Renderiza `form` com classe padrão.
- Repassa props nativas do formulário.
- Usa `layout.module.css`.

## Relações

- **Usa:** `layout.module.css`.
- **Usado por:** formulários que seguirem o padrão de layout.

## Notas

- Fonte única para formulários com `grid`/`gap`; o antigo `.contasForm` foi substituído por uso direto do `Form` comum.
